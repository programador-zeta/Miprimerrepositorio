import Link from "next/link";
import { ExperienceEditor } from "@/components/experience-editor";
import { requireUser } from "@/lib/supabase/server";
import { ActionForm } from "@/components/forms";
import { ExperienceCard } from "@/components/experience-card";
import { deleteExperience } from "@/lib/experience-actions";
import { type Experience } from "@/lib/experiences";
export default async function EditExperiences({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { supabase, user } = await requireUser(),
    { id } = await searchParams;
  const { data, error } = await supabase
    .from("experiences")
    .select(
      "id,type,name,place,experience_date,photo_url,media,note,visibility",
    )
    .eq("user_id", user.id)
    .order("experience_date", { ascending: false });
  if (error) throw new Error("No se pudieron cargar tus experiencias.");
  const experiences = data as Experience[],
    editing = experiences.find((e) => e.id === id);
  return (
    <main className="workspace">
      <div className="eyebrow">TU ESPACIO / EXPERIENCIAS</div>
      <h1>
        Sal. Explora.
        <br />
        <em>Recuérdalo.</em>
      </h1>
      <p className="intro">
        Guarda los lugares que se quedan contigo. Tú eliges qué compartir.
      </p>
      <section className="panel" id="editor">
        <h2>{editing ? "Editar experiencia" : "Una nueva experiencia"}</h2>
        {id && !editing && (
          <p role="alert">No encontramos esa experiencia en tu cuenta.</p>
        )}
        <ExperienceEditor key={editing?.id || "new"} experience={editing} />
        {editing && (
          <Link className="text-link" href="/dashboard/experiences">
            Cancelar edición / Crear otra experiencia
          </Link>
        )}
      </section>
      <div className="section-heading">
        <h2 className="section-title">
          Tu colección <span>({experiences.length})</span>
        </h2>
      </div>
      {experiences.length ? (
        <div className="experience-grid">
          {experiences.map((e) => (
            <div key={e.id}>
              <ExperienceCard experience={e} />
              <div className="experience-controls">
                <span className="visibility-label">
                  {e.visibility === "public" ? "PÚBLICA" : "PRIVADA"}
                </span>
                <Link
                  className="text-link"
                  href={`/dashboard/experiences?id=${e.id}#editor`}
                >
                  Editar
                </Link>
              </div>
              <details className="delete-details">
                <summary>Eliminar experiencia</summary>
                <ActionForm
                  action={deleteExperience}
                  label="Eliminar definitivamente"
                >
                  <input type="hidden" name="id" value={e.id} />
                  <label className="checkbox-field">
                    <input
                      type="checkbox"
                      name="confirm"
                      value="yes"
                      required
                    />{" "}
                    Confirmo que quiero eliminar esta experiencia y sus fotos y
                    videos.
                  </label>
                </ActionForm>
              </details>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          Tu colección empieza con tu próxima salida.
        </div>
      )}
    </main>
  );
}
