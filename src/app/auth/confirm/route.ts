import { NextRequest, NextResponse } from "next/server";
import { sessionSupabase } from "@/lib/supabase/server";
import { authDestination, confirmationRedirect } from "@/lib/auth-navigation";
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const next = authDestination(params.get("next") || undefined);
  const supabase = await sessionSupabase();
  const code = params.get("code"),
    hash = params.get("token_hash"),
    type = params.get("type");
  let valid = false;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    valid = !error;
  } else if (hash && (type === "signup" || type === "email")) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: hash, type });
    valid = !error;
  }
  // Next may see an internal bind address behind a reverse proxy. Use the public
  // deployment origin; only loopback Host headers are accepted for local development.
  const host = request.headers.get("host") || "";
  const local = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)
    ? `http://${host}`
    : "http://127.0.0.1:3000";
  const origin = new URL(
    confirmationRedirect(
      process.env.SITE_URL || process.env.RENDER_EXTERNAL_URL || local,
      next,
    ),
  ).origin;
  const destination = valid ? new URL(next, origin) : new URL("/login", origin);
  if (!valid) {
    destination.searchParams.set("next", next);
    destination.searchParams.set("confirmation", "invalid");
  }
  const response = NextResponse.redirect(destination);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
