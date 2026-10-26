import { LoginForm } from "@/components/forms";
export const metadata = {
  title: "Tu cuenta — SOMEWHERE",
  robots: { index: false, follow: false },
};
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <main className="state-wrap">
      <section className="state-card">
        <div className="eyebrow">TU HISTORIA, CONTIGO</div>
        <h1>
          Bienvenido
          <br />
          <em>afuera.</em>
        </h1>
        <p>Inicia sesión o crea tu cuenta para hacer tuyo tu Somewhere Tag.</p>
        <LoginForm next={next || "/dashboard"} />
      </section>
    </main>
  );
}
