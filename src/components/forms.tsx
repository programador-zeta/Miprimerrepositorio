"use client";
import { useActionState } from "react";
import { authenticate, activate, type FormState } from "@/lib/auth-actions";
export function Feedback({ state }: { state: FormState }) {
  return (
    <>
      {state.error && (
        <p className="notice" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="notice" role="status">
          {state.success}
        </p>
      )}
    </>
  );
}
export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(
    authenticate.bind(null, next),
    {},
  );
  return (
    <form action={action} className="form-stack">
      <label className="field">
        Correo electrónico
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
        />
      </label>
      <label className="field">
        Contraseña
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          maxLength={128}
        />
      </label>
      <Feedback state={state} />
      <button className="button" name="mode" value="login" disabled={pending}>
        {pending ? "Conectando…" : "Iniciar sesión"}
        <span className="arrow" aria-hidden="true" />
      </button>
      <button
        className="button secondary"
        name="mode"
        value="signup"
        disabled={pending}
      >
        Crear mi cuenta
      </button>
      <p className="status-note">
        Usamos tu correo para tu cuenta. No aparece en tu perfil público.
      </p>
    </form>
  );
}
export function ActivationForm({ code }: { code: string }) {
  const [state, action, pending] = useActionState(
    activate.bind(null, code),
    {},
  );
  return (
    <form action={action} className="form-stack">
      <label className="field">
        Código secreto de activación
        <input
          name="activation_code"
          type="password"
          autoComplete="off"
          required
          minLength={6}
          maxLength={128}
          placeholder="El código que viene con tu tag"
        />
      </label>
      <Feedback state={state} />
      <button className="button" disabled={pending}>
        {pending ? "Activando…" : "Activar mi tag"}
        <span className="arrow" aria-hidden="true" />
      </button>
    </form>
  );
}
export function ActionForm({
  action,
  children,
  label = "Guardar cambios",
}: {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  children: React.ReactNode;
  label?: string;
}) {
  const [state, submit, pending] = useActionState(action, {});
  return (
    <form action={submit} className="editor-form">
      {children}
      <Feedback state={state} />
      <button className="button" disabled={pending}>
        {pending ? "Guardando…" : label}
        <span className="arrow" aria-hidden="true" />
      </button>
    </form>
  );
}
