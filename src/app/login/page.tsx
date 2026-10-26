import { LoginForm } from "@/components/forms";
export const metadata = {
  title: "Tu cuenta — SOMEWHERE",
  robots: { index: false, follow: false },
};
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; confirmation?: string }>;
}) {
  const { next, confirmation } = await searchParams;
  return (
    <main className="state-wrap">
      <section className="state-card">
        <div className="eyebrow">TU HISTORIA, CONTIGO</div>
        <h1>
          Tu cuenta
          <br />
          <em>te espera.</em>
        </h1>
        <p>¿Ya tienes una cuenta? Inicia sesión para continuar tu historia.</p>
        {confirmation === "invalid" && (
          <p role="alert" className="notice">
            No pudimos completar la confirmación. Abre el último correo recibido
            desde el navegador donde te registraste. Si ya confirmaste tu
            cuenta, intenta iniciar sesión.
          </p>
        )}
        <LoginForm next={next || "/dashboard"} />
      </section>
    </main>
  );
}
