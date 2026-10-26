import Link from "next/link";
import { requireUser } from "@/lib/supabase/server";
import { ActionForm } from "@/components/forms";
import { toggleTag } from "@/lib/experience-actions";
export default async function Tags() {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("tags")
    .select("id,public_code,status,created_at")
    .eq("owner_id", user.id)
    .order("created_at");
  if (error) throw new Error("No se pudieron cargar tus tags.");
  return (
    <main className="workspace">
      <div className="eyebrow">TU ESPACIO / TAGS</div>
      <h1>
        Pequeño objeto.
        <br />
        <em>Gran historia.</em>
      </h1>
      <p className="intro">
        Todos tus tags llevan a tu perfil. Puedes pausarlos y reactivarlos sin
        perder tus datos.
      </p>
      {data.length ? (
        data.map((t) => (
          <section className="panel" key={t.id}>
            <div className="tag-row">
              <strong>{t.public_code}</strong>
              <span>{t.status === "active" ? "Activo" : "Deshabilitado"}</span>
              <Link className="text-link" href={`/t/${t.public_code}`}>
                Abrir tag <span className="arrow" />
              </Link>
            </div>
            <ActionForm
              action={toggleTag}
              label={
                t.status === "active" ? "Deshabilitar tag" : "Reactivar tag"
              }
            >
              <input type="hidden" name="code" value={t.public_code} />
              <input
                type="hidden"
                name="enabled"
                value={t.status === "active" ? "false" : "true"}
              />
            </ActionForm>
          </section>
        ))
      ) : (
        <div className="empty-state">
          Aún no tienes tags. Abre la URL de tu etiqueta y usa su código secreto
          para activarla.
        </div>
      )}
      <p className="hint">
        Deshabilitar un tag bloquea su entrada NFC. Tu perfil público seguirá
        disponible en su dirección.
      </p>
    </main>
  );
}
