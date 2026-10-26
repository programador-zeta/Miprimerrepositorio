"use server";
import { requireUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { FormState } from "@/lib/auth-actions";
export async function saveProfile(
  _: FormState,
  form: FormData,
): Promise<FormState> {
  const { supabase, user } = await requireUser();
  const name = String(form.get("name") || "").trim(),
    username = String(form.get("username") || "")
      .trim()
      .toLowerCase(),
    city = String(form.get("city") || "").trim(),
    bio = String(form.get("bio") || "").trim(),
    social = String(form.get("social_link") || "").trim();
  if (
    !name ||
    name.length > 80 ||
    !/^[a-z0-9_]{3,30}$/.test(username) ||
    city.length > 100 ||
    bio.length > 400
  )
    return {
      error:
        "Revisa los campos. Tu usuario debe tener entre 3 y 30 letras minúsculas, números o guiones bajos.",
    };
  if (social) {
    try {
      const u = new URL(social);
      if (u.protocol !== "https:")
        return { error: "El enlace debe empezar con https://." };
    } catch {
      return { error: "Introduce un enlace válido con https://." };
    }
  }
  let photo: string | undefined;
  try {
    photo = await uploadPhoto(form, "avatars");
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "No pudimos subir tu foto.",
    };
  }
  const { error } = await supabase
    .from("profiles")
    .update({
      name,
      username,
      city,
      bio,
      social_link: social || null,
      ...(photo ? { profile_photo: photo } : {}),
    })
    .eq("user_id", user.id);
  if (error) {
    if (photo) await supabase.storage.from("avatars").remove([photo]);
    return {
      error:
        error.code === "23505"
          ? "Ese nombre de usuario ya está en uso. Prueba con otro."
          : "No pudimos guardar el perfil.",
    };
  }
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  revalidatePath(`/u/${username}`);
  return { success: "Perfil guardado. Tu historia ya tiene un lugar." };
}
export async function uploadPhoto(
  form: FormData,
  bucket: "avatars" | "experience-photos",
): Promise<string | undefined> {
  const file = form.get("photo");
  if (!(file instanceof File) || !file.size) return undefined;
  if (file.size > 5 * 1024 * 1024)
    throw new Error("La foto debe pesar menos de 5 MB.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const png =
    bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71;
  const jpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const webp =
    new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
    new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
  const ext = png ? "png" : jpg ? "jpg" : webp ? "webp" : null;
  if (!ext) throw new Error("Elige una foto JPG, PNG o WebP.");
  const { supabase, user } = await requireUser();
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, bytes, {
      contentType: ext === "jpg" ? "image/jpeg" : `image/${ext}`,
      upsert: false,
    });
  if (error) throw new Error("No pudimos subir la foto. Inténtalo de nuevo.");
  return path;
}
