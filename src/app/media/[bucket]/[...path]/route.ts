import { sessionSupabase } from "@/lib/supabase/server";
export async function GET(
  request: Request,
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
  // RLS is evaluated on every request, including video seeking. Keep the signed URL server-side.
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path.join("/"), 60);
  if (error || !data) return new Response(null, { status: 404 });
  const headers = new Headers();
  const range = request.headers.get("range");
  if (range) headers.set("Range", range);
  const upstream = await fetch(data.signedUrl, {
    headers,
    cache: "no-store",
    signal: request.signal,
  });
  if (!upstream.ok && upstream.status !== 416)
    return new Response(null, { status: 404 });
  const responseHeaders = new Headers({
    "Cache-Control":
      bucket === "avatars" ? "public, max-age=3600" : "private, no-store",
    Vary: "Cookie",
    "X-Content-Type-Options": "nosniff",
    "X-Robots-Tag": "noindex",
  });
  for (const name of [
    "content-type",
    "content-length",
    "content-range",
    "accept-ranges",
  ]) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
