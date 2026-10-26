import { SignupForm } from "@/components/forms";
import { authDestination } from "@/lib/auth-navigation";
export const metadata = {
  title: "Crear cuenta — SOMEWHERE",
  robots: { index: false, follow: false },
};
export default async function Signup({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <main className="state-wrap">
      <section className="state-card">
        <div className="eyebrow">UNA NUEVA HISTORIA</div>
        <h1>
          Crea tu
          <br />
          <em>cuenta.</em>
        </h1>
        <p>
          Tu nombre, tu correo y una contraseña. El tag lo conectarás después.
        </p>
        <SignupForm next={authDestination(next)} />
      </section>
    </main>
  );
}
