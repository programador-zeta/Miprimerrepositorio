export type ExperienceMedia = { path: string; kind: "image" | "video" };
export const MAX_MEDIA = 10;
export const mediaFormats: Record<
  string,
  { extension: string; kind: ExperienceMedia["kind"]; maxSize: number }
> = {
  "image/jpeg": { extension: "jpg", kind: "image", maxSize: 5 * 1024 * 1024 },
  "image/png": { extension: "png", kind: "image", maxSize: 5 * 1024 * 1024 },
  "image/webp": { extension: "webp", kind: "image", maxSize: 5 * 1024 * 1024 },
  "video/mp4": { extension: "mp4", kind: "video", maxSize: 25 * 1024 * 1024 },
  "video/webm": { extension: "webm", kind: "video", maxSize: 25 * 1024 * 1024 },
  "video/quicktime": {
    extension: "mov",
    kind: "video",
    maxSize: 25 * 1024 * 1024,
  },
};
export function validateMediaFile(type: string, size: number) {
  const format = Object.hasOwn(mediaFormats, type) ? mediaFormats[type] : undefined;
  if (!format) return "Usa fotos JPG, PNG o WebP, o videos MP4, WebM o MOV.";
  if (!Number.isSafeInteger(size) || size <= 0 || size > format.maxSize)
    return format.kind === "video"
      ? "Cada video puede pesar hasta 25 MB."
      : "Cada foto puede pesar hasta 5 MB.";
  return null;
}
export function validMedia(
  items: unknown,
  userId: string,
): items is ExperienceMedia[] {
  if (!Array.isArray(items) || items.length > MAX_MEDIA) return false;
  const paths = new Set<string>();
  return items.every((item) => {
    if (
      !item ||
      typeof item !== "object" ||
      typeof item.path !== "string" ||
      !item.path.startsWith(userId + "/")
    )
      return false;
    const filename = item.path.slice(userId.length + 1);
    const pattern =
      item.kind === "image"
        ? /^[a-f0-9-]{36}\.(jpg|png|webp)$/
        : item.kind === "video"
          ? /^[a-f0-9-]{36}\.(mp4|webm|mov)$/
          : null;
    if (!pattern?.test(filename) || paths.has(item.path)) return false;
    paths.add(item.path);
    return true;
  });
}
export function experienceMedia(experience: {
  media?: ExperienceMedia[];
  photo_url: string | null;
}): ExperienceMedia[] {
  return experience.media?.length
    ? experience.media
    : experience.photo_url
      ? [{ path: experience.photo_url, kind: "image" }]
      : [];
}
export function experienceMediaUrl(path: string) {
  return `/media/experience-photos/${path.split("/").map(encodeURIComponent).join("/")}`;
}
