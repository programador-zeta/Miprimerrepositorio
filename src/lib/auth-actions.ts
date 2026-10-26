"use server";
import { sessionSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { validTagCode } from "@/lib/tags";
export type FormState = { error?: string; success?: string };
export async function authenticate(
  next: string,
  _: FormState,
  form: FormData,
): Promise<FormState> {
  const email = String(form.get("email") || "").trim(),
    password = String(form.get("password") || "");
  const signup = form.get("mode") === "signup";
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
  const supabase = await sessionSupabase();
  const { data, error } = signup
    ? await supabase.auth.signUp({ email, password })
    : await supabase.auth.signInWithPassword({ email, password });
  if (error)
    return {
      error: signup
        ? "No pudimos crear la cuenta. Revisa tus datos o intenta iniciar sesión."
        : "Correo o contraseña incorrectos. Inténtalo de nuevo.",
    };
  if (!data.session)
    return {
      success: "Revisa tu correo y confirma tu cuenta antes de iniciar sesión.",
    };
  const target = /^\/activate\/[A-Z0-9]{4,24}$/.test(next)
    ? next
    : "/dashboard";
  redirect(target);
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
