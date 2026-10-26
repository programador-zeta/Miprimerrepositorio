import Link from "next/link";
import { requireUser } from "@/lib/supabase/server";
import {
  experienceTypes,
  formatDate,
  type ExperienceType,
} from "@/lib/experiences";
export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ activated?: string }>;
}) {
  const { supabase, user } = await requireUser(),
    { activated } = await searchParams;
  const [profileResult, tagsResult, experiencesResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("username,name")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("tags")
      .select("id,public_code,status")
      .eq("owner_id", user.id),
    supabase
      .from("experiences")
      .select("id,type,name,place,experience_date,visibility")
      .eq("user_id", user.id)
      .order("experience_date", { ascending: false }),
  ]);
  if (profileResult.error || tagsResult.error || experiencesResult.error)
    throw new Error("No se pudo cargar tu espacio.");
  const profile = profileResult.data,
    tags = tagsResult.data,
    experiences = experiencesResult.data;
  return (
    <main className="workspace">
      <div className="eyebrow">TU ESPACIO / SOMEWHERE</div>
      <div className="section-heading">
        <h1>
          El siguiente
          <br />
          <em>capítulo.</em>
        </h1>
        <Link href={`/u/${profile.username}`} className="text-link">
          Ver mi perfil público <span className="arrow" />
        </Link>
      </div>
      {activated && (
        <p className="notice" role="status">
          Tu Somewhere Tag ya está activo.
        </p>
      )}
      <p className="intro">
        {profile.name
          ? `${profile.name}, siempre hay otro lugar.`
          : "Tu historia empieza contigo. Prepara tu perfil y haz tuyo este espacio."}
      </p>
      <div className="dashboard-metrics">
        <div>
          <strong>{experiences.length}</strong>
          <span>EXPERIENCIAS</span>
        </div>
        <div>
          <strong>
            {new Set(experiences.map((e) => e.place.trim().toLowerCase())).size}
          </strong>
          <span>LUGARES</span>
        </div>
        <div>
          <strong>{tags.filter((t) => t.status === "active").length}</strong>
          <span>TAGS ACTIVOS</span>
        </div>
      </div>
      <div className="dashboard-cards">
        {[
          [
            "01",
            "Tu perfil",
            "Nombre, foto y lo que te mueve.",
            "/dashboard/profile",
          ],
          [
            "02",
            "Emergencia",
            "Tu contacto, a un toque de distancia.",
            "/dashboard/emergency",
          ],
          [
            "03",
            "Experiencias",
            "Lugares que se quedan contigo.",
            "/dashboard/experiences",
          ],
          [
            "04",
            "Tus tags",
            "Conecta, pausa y sigue explorando.",
            "/dashboard/tags",
          ],
        ].map(([number, title, copy, href]) => (
          <Link className="dashboard-card" key={href} href={href}>
            <span>{number} /</span>
            <h2>{title}</h2>
            <p>{copy}</p>
            <span className="arrow" aria-hidden="true" />
          </Link>
        ))}
      </div>
      <section className="panel">
        <h2>Tu actividad reciente</h2>
        {experiences.length ? (
          experiences.slice(0, 4).map((e) => (
            <Link
              className="activity-row"
              href={`/dashboard/experiences?id=${e.id}#editor`}
              key={e.id}
            >
              <span>{experienceTypes[e.type as ExperienceType]}</span>
              <div>
                <strong>{e.name}</strong>
                <p>
                  {e.place} ·{" "}
                  {e.visibility === "public" ? "Pública" : "Privada"}
                </p>
              </div>
              <time dateTime={e.experience_date}>
                {formatDate(e.experience_date)}
              </time>
            </Link>
          ))
        ) : (
          <p>
            Aún no hay experiencias. La próxima salida puede ser la primera.
          </p>
        )}
      </section>
      <p className="hint">
        Este espacio es privado. Tu perfil público muestra únicamente las
        experiencias que eliges compartir.
      </p>
    </main>
  );
}
