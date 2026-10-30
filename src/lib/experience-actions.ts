"use server";
import { requireUser } from "@/lib/supabase/server";
import {
  experienceMedia,
  validMedia,
  validateMediaFile,
  type ExperienceMedia,
} from "@/lib/experience-media";
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
  let previous: ExperienceMedia[] = [];
  if (id) {
    if (!/^[a-f0-9-]{36}$/.test(id))
      return { error: "La experiencia no es válida." };
    const { data, error } = await supabase
      .from("experiences")
      .select("photo_url,media")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (error || !data)
      return { error: "No encontramos esa experiencia en tu cuenta." };
    previous = experienceMedia(data);
  }
  let media: unknown;
  try {
    media = JSON.parse(String(form.get("media") || "[]"));
  } catch {
    return { error: "No pudimos leer las fotos y videos. Inténtalo de nuevo." };
  }
  if (!validMedia(media, user.id) || !media.length)
    return { error: "Añade entre 1 y 10 fotos o videos a tu aventura." };
  // Verify that each object exists and belongs to this user before publishing it.
  for (const item of media) {
    const { data, error } = await supabase.storage
      .from("experience-photos")
      .info(item.path);
    if (
      error ||
      !data ||
      !data.contentType ||
      validateMediaFile(data.contentType, data.size || 0) ||
      (item.kind === "video") !== data.contentType.startsWith("video/")
    )
      return {
        error:
          "Una foto o video no terminó de subir o no tiene un formato válido. Vuelve a intentarlo.",
      };
  }
  const values = {
    name,
    place,
    type,
    experience_date: date,
    note: note || null,
    visibility,
    photo_url: media.find((item) => item.kind === "image")?.path || null,
    media,
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
    return { error: "No pudimos guardar la experiencia." };
  }
  // Another adventure may reuse an owned file. Remove only unreferenced objects.
  const removed = previous.filter(
    (item) => !media.some((m) => m.path === item.path),
  );
  if (removed.length) {
    const { discardPendingMedia } = await import("@/lib/media-actions");
    await discardPendingMedia(removed);
  }
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
    .select("photo_url,media")
    .maybeSingle();
  if (error || !data) return { error: "No pudimos eliminar la experiencia." };
  const { discardPendingMedia } = await import("@/lib/media-actions");
  await discardPendingMedia(experienceMedia(data));
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
