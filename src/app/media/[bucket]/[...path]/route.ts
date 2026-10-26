import { sessionSupabase } from "@/lib/supabase/server";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ bucket: string; path: string[] }> },
) {
  const { bucket, path } = await params;
  if (
    !["avatars", "experience-photos"].includes(bucket) ||
    path.length !== 2 ||
    !path.every((p) => /^[a-zA-Z0-9.-]+$/.test(p)) ||
    path.some((p) => p === "..")
  )
    return new Response(null, { status: 404 });
  const supabase = await sessionSupabase();
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path.join("/"));
  if (error || !data) return new Response(null, { status: 404 });
  return new Response(data, {
    headers: {
      "Content-Type": data.type,
      "Cache-Control":
        bucket === "avatars" ? "public, max-age=3600" : "private, no-store",
      Vary: "Cookie",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex",
    },
  });
}
