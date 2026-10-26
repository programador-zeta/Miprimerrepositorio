"use server";
import { requireUser } from "@/lib/supabase/server";
import { uploadPhoto } from "@/lib/profile-actions";
import { experienceTypes, validDate } from "@/lib/experiences";
import { revalidatePath } from "next/cache";
import type { FormState } from "@/lib/auth-actions";
export async function saveExperience(
  _: FormState,
  form: FormData,
): Promise<FormState> {
  const { supabase, user } = await requireUser();
  const id = String(form.get("id") || "");
  const name = String(form.get("name") || "").trim(),
    place = String(form.get("place") || "").trim(),
    type = String(form.get("type") || ""),
    date = String(form.get("experience_date") || ""),
    note = String(form.get("note") || "").trim(),
    visibility = String(form.get("visibility") || "private");
  if (
    !name ||
    name.length > 120 ||
    !place ||
    place.length > 160 ||
    !Object.hasOwn(experienceTypes, type) ||
    !validDate(date) ||
    note.length > 1500 ||
    !["public", "private"].includes(visibility)
  )
    return {
      error:
        "Revisa el nombre, lugar, tipo, fecha y visibilidad de la experiencia.",
    };
  let previous: string | null = null;
  if (id) {
    if (!/^[a-f0-9-]{36}$/.test(id))
      return { error: "La experiencia no es válida." };
    const { data, error } = await supabase
      .from("experiences")
      .select("photo_url")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (error || !data)
      return { error: "No encontramos esa experiencia en tu cuenta." };
    previous = data.photo_url;
  }
  let photo: string | undefined;
  try {
    photo = await uploadPhoto(form, "experience-photos");
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "No pudimos subir la foto.",
    };
  }
  if (!id && !photo)
    return { error: "Añade una fotografía para tu experiencia." };
  const values = {
    name,
    place,
    type,
    experience_date: date,
    note: note || null,
    visibility,
    photo_url: photo || previous,
  };
  const result = id
    ? await supabase
        .from("experiences")
        .update(values)
        .eq("id", id)
        .eq("user_id", user.id)
        .select("id")
        .maybeSingle()
    : await supabase
        .from("experiences")
        .insert({ ...values, user_id: user.id })
        .select("id")
        .single();
  if (result.error || !result.data) {
    if (photo) await supabase.storage.from("experience-photos").remove([photo]);
    return { error: "No pudimos guardar la experiencia." };
  }
  if (photo && previous)
    await supabase.storage.from("experience-photos").remove([previous]);
  revalidatePath("/dashboard/experiences");
  revalidatePath("/dashboard");
  return {
    success: id
      ? "Experiencia actualizada."
      : "Experiencia guardada. Un lugar más en tu historia.",
  };
}
export async function deleteExperience(
  _: FormState,
  form: FormData,
): Promise<FormState> {
  const { supabase, user } = await requireUser(),
    id = String(form.get("id") || "");
  if (form.get("confirm") !== "yes")
    return { error: "Confirma que quieres eliminar la experiencia." };
  const { data, error } = await supabase
    .from("experiences")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("photo_url")
    .maybeSingle();
  if (error || !data) return { error: "No pudimos eliminar la experiencia." };
  if (data.photo_url)
    await supabase.storage.from("experience-photos").remove([data.photo_url]);
  revalidatePath("/dashboard/experiences");
  revalidatePath("/dashboard");
  return { success: "Experiencia eliminada." };
}
export async function toggleTag(
  _: FormState,
  form: FormData,
): Promise<FormState> {
  const { supabase } = await requireUser();
  const code = String(form.get("code") || ""),
    enabled = form.get("enabled") === "true";
  const { error } = await supabase.rpc("set_tag_enabled", { code, enabled });
  if (error) return { error: "No pudimos cambiar el estado del tag." };
  revalidatePath("/dashboard/tags");
  revalidatePath("/dashboard");
  return {
    success: enabled
      ? "Tag reactivado."
      : "Tag deshabilitado. Puedes reactivarlo cuando quieras.",
  };
}
