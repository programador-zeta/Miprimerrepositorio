import { notFound, redirect } from "next/navigation";
import { sessionSupabase } from "@/lib/supabase/server";
import { validTagCode } from "@/lib/tags";
import { ActivationForm } from "@/components/forms";
export const metadata = {
  title: "Activa tu tag — SOMEWHERE",
  robots: { index: false, follow: false },
};
export default async function ActivatePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  if (!validTagCode(code)) notFound();
  const supabase = await sessionSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/activate/${code}`);
  return (
    <main className="state-wrap">
      <section className="state-card">
        <div className="tag-symbol">
          <span className="arrow" />
        </div>
        <div className="eyebrow">SOMEWHERE TAG · {code}</div>
        <h1>
          Hazlo
          <br />
          <em>tuyo.</em>
        </h1>
        <p>
          Introduce el código secreto que viene con tu tag. Es distinto al
          código público de la etiqueta.
        </p>
        <ActivationForm code={code} />
      </section>
    </main>
  );
}
