"use server";
import { requireUser } from "@/lib/supabase/server";
import {
  mediaFormats,
  validateMediaFile,
  validMedia,
  type ExperienceMedia,
} from "@/lib/experience-media";

// Only the signed, single-use upload URL reaches the browser, never an account key.
export async function prepareMediaUpload(type: string, size: number) {
  const { supabase, user } = await requireUser();
  const error = validateMediaFile(type, size);
  if (error) return { error };
  const format = mediaFormats[type];
  const path = `${user.id}/${crypto.randomUUID()}.${format.extension}`;
  const { data, error: uploadError } = await supabase.storage
    .from("experience-photos")
    .createSignedUploadUrl(path);
  if (uploadError)
    return { error: "No pudimos preparar la subida. Inténtalo de nuevo." };
  return {
    signedUrl: data.signedUrl,
    media: { path, kind: format.kind } satisfies ExperienceMedia,
  };
}

export async function discardPendingMedia(items: ExperienceMedia[]) {
  const { supabase, user } = await requireUser();
  if (!validMedia(items, user.id) || !items.length) return;
  const { data, error } = await supabase
    .from("experiences")
    .select("photo_url,media")
    .eq("user_id", user.id);
  if (error) return;
  const referenced = new Set(
    data.flatMap((e) => [
      e.photo_url,
      ...(e.media as ExperienceMedia[]).map((m) => m.path),
    ]),
  );
  const unused = items
    .map((item) => item.path)
    .filter((path) => !referenced.has(path));
  if (unused.length)
    await supabase.storage.from("experience-photos").remove(unused);
}
