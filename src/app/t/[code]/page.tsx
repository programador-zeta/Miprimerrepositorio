import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { publicSupabase } from "@/lib/supabase/server";
import { validTagCode, parseTag, type TagResult } from "@/lib/tags";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Tu tag — SOMEWHERE",
  robots: { index: false, follow: false },
};
export default async function TagPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  if (!validTagCode(code)) notFound();
  let tag: TagResult | null;
  try {
    const { data, error } = await publicSupabase().rpc("resolve_tag", { code });
    if (error) throw error;
    tag = parseTag(data);
  } catch {
    return (
      <main className="state-wrap">
        <section className="state-card">
          <div className="tag-symbol">
            <span className="arrow" aria-hidden="true" />
          </div>
          <div className="eyebrow">CONEXIÓN CON SOMEWHERE</div>
          <h1>
            Un momento
            <br />
            <em>para conectar.</em>
          </h1>
          <p>
            No pudimos consultar este tag. Inténtalo de nuevo en unos instantes.
          </p>
          <Link href={`/t/${code}`} className="button">
            Volver a intentar <span className="arrow" aria-hidden="true" />
          </Link>
          <div className="state-code">{code}</div>
        </section>
      </main>
    );
  }
  if (!tag) notFound();
  if (tag.status === "active" && tag.username)
    redirect(`/u/${encodeURIComponent(tag.username)}`);
  if (tag.status === "disabled")
    return (
      <main className="state-wrap">
        <section className="state-card">
          <div className="tag-symbol">—</div>
          <div className="eyebrow">SOMEWHERE TAG</div>
          <h1>En pausa.</h1>
          <p>Este Somewhere Tag no está disponible.</p>
          <Link href="/" className="button secondary">
            Volver al inicio <span className="arrow" aria-hidden="true" />
          </Link>
        </section>
      </main>
    );
  if (tag.status === "active")
    return (
      <main className="state-wrap">
        <section className="state-card">
          <div className="eyebrow">SOMEWHERE TAG</div>
          <h1>
            Una historia
            <br />
            <em>en camino.</em>
          </h1>
          <p>El propietario de este tag aún está preparando su perfil.</p>
        </section>
      </main>
    );
  return (
    <main className="state-wrap">
      <section className="state-card">
        <div className="tag-symbol">
          <span className="arrow" aria-hidden="true" />
        </div>
        <div className="eyebrow">TU PRÓXIMA HISTORIA EMPIEZA AQUÍ</div>
        <h1>
          Este tag aún
          <br />
          no está <em>activado</em>
        </h1>
        <p>
          Hazlo tuyo. Conecta tu Somewhere Tag y empieza a llevar tu historia
          contigo.
        </p>
        <Link href={`/activate/${code}`} className="button">
          Activar mi tag <span className="arrow" aria-hidden="true" />
        </Link>
        <div className="state-code">SOMEWHERE TAG · {code}</div>
      </section>
    </main>
  );
}
