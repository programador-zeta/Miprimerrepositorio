import "server-only";
import { notFound } from "next/navigation";
import { publicSupabase } from "@/lib/supabase/server";
export async function getPublicProfile(username: string) {
  if (!/^[a-z0-9_]{3,30}$/.test(username)) notFound();
  const { data, error } = await publicSupabase()
    .from("profiles")
    .select("id,user_id,username,name,bio,city,profile_photo,social_link")
    .eq("username", username)
    .maybeSingle();
  if (error) throw new Error("No se pudo cargar el perfil.");
  if (!data) notFound();
  return data;
}
export function mediaUrl(
  bucket: "avatars" | "experience-photos",
  path: string | null,
) {
  return path
    ? `/media/${bucket}/${path.split("/").map(encodeURIComponent).join("/")}`
    : null;
}
