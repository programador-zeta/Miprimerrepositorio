"use server";
import { sessionSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { validTagCode } from "@/lib/tags";
import { authErrorMessage } from "@/lib/auth-errors";
import { authDestination, confirmationRedirect } from "@/lib/auth-navigation";
export type FormState = { error?: string; success?: string };
export async function authenticate(
  next: string,
  _: FormState,
  form: FormData,
): Promise<FormState> {
  return performAuth(next, false, form);
}
export async function register(
  next: string,
  _: FormState,
  form: FormData,
): Promise<FormState> {
  return performAuth(next, true, form);
}
async function performAuth(
  next: string,
  signup: boolean,
  form: FormData,
): Promise<FormState> {
  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "");
  const name = String(form.get("name") || "").trim();
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    password.length < 8 ||
    password.length > 128
  )
    return {
      error:
        "Introduce un correo válido y una contraseña de entre 8 y 128 caracteres.",
    };
  if (signup && (!name || name.length > 80))
    return { error: "Indica tu nombre para crear tu cuenta." };
  if (signup && password !== String(form.get("password_confirm") || ""))
    return { error: "Las contraseñas no coinciden. Escríbelas de nuevo." };
  const supabase = await sessionSupabase();
  const { data, error } = signup
    ? await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: confirmationRedirect(
            process.env.SITE_URL ||
              process.env.RENDER_EXTERNAL_URL ||
              "http://127.0.0.1:3000",
            next,
          ),
        },
      })
    : await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // Record only diagnostic codes, never form data, credentials or raw provider messages.
    console.error("somewhere_auth_failed", {
      operation: signup ? "signup" : "login",
      code: error.code ?? "unknown",
      status: error.status,
    });
    return { error: authErrorMessage(error, signup) };
  }
  if (!data.session)
    return {
      success: "Revisa tu correo y confirma tu cuenta antes de iniciar sesión.",
    };
  redirect(authDestination(next));
}
export async function activate(
  code: string,
  _: FormState,
  form: FormData,
): Promise<FormState> {
  if (!validTagCode(code)) return { error: "El tag no es válido." };
  const secret = String(form.get("activation_code") || "").trim();
  if (secret.length < 6 || secret.length > 128)
    return { error: "Introduce el código secreto que recibiste con tu tag." };
  const supabase = await sessionSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/activate/${code}`);
  const { error } = await supabase.rpc("claim_tag", { code, secret });
  if (error)
    return {
      error:
        "No pudimos activar el tag. Comprueba el código secreto; el tag debe estar sin reclamar.",
    };
  redirect("/dashboard?activated=1");
}
export async function logout() {
  const supabase = await sessionSupabase();
  await supabase.auth.signOut();
  redirect("/");
}
