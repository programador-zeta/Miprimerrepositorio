import Link from "next/link";
import { requireUser } from "@/lib/supabase/server";
import { ActionForm } from "@/components/forms";
import { ExperienceCard } from "@/components/experience-card";
import { saveExperience, deleteExperience } from "@/lib/experience-actions";
import { experienceTypes, type Experience } from "@/lib/experiences";
export default async function EditExperiences({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { supabase, user } = await requireUser(),
    { id } = await searchParams;
  const { data, error } = await supabase
    .from("experiences")
    .select("id,type,name,place,experience_date,photo_url,note,visibility")
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
        <ActionForm
          action={saveExperience}
          key={editing?.id || "new"}
          label={editing ? "Guardar experiencia" : "Crear experiencia"}
        >
          <input type="hidden" name="id" value={editing?.id || ""} />
          <div className="form-grid">
            <label className="field">
              Tipo
              <select
                aria-label="Tipo"
                name="type"
                defaultValue={editing?.type || "hike"}
              >
                {Object.entries(experienceTypes).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Fecha
              <input
                name="experience_date"
                type="date"
                required
                defaultValue={editing?.experience_date}
              />
            </label>
          </div>
          <label className="field">
            Nombre de la experiencia
            <input
              name="name"
              required
              maxLength={120}
              defaultValue={editing?.name}
            />
          </label>
          <label className="field">
            Lugar
            <input
              name="place"
              required
              maxLength={160}
              defaultValue={editing?.place}
            />
          </label>
          <label className="field">
            Fotografía
            <input
              type="file"
              name="photo"
              required={!editing}
              accept="image/jpeg,image/png,image/webp"
            />
            <span className="hint">
              Máximo 5 MB.
              {editing ? " Si no eliges otra, conservamos la actual." : ""}
            </span>
          </label>
          <label className="field">
            Nota (opcional)
            <textarea
              name="note"
              rows={3}
              maxLength={1500}
              defaultValue={editing?.note || ""}
            />
          </label>
          <label className="field">
            Visibilidad
            <select
              aria-label="Visibilidad"
              name="visibility"
              defaultValue={editing?.visibility || "private"}
            >
              <option value="private">Privada — solo tú</option>
              <option value="public">Pública — visible en tu perfil</option>
            </select>
          </label>
        </ActionForm>
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
                    Confirmo que quiero eliminar esta experiencia y su
                    fotografía.
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
