import Link from "next/link";
import { getPublicProfile } from "@/lib/profile";
import { publicSupabase } from "@/lib/supabase/server";
import {
  experienceTypes,
  formatDate,
  type ExperienceType,
} from "@/lib/experiences";
export const dynamic = "force-dynamic";
export default async function Summary({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params,
    p = await getPublicProfile(username);
  const { data, error } = await publicSupabase()
    .from("experiences")
    .select("id,type,name,place,experience_date")
    .eq("user_id", p.user_id)
    .eq("visibility", "public")
    .order("experience_date", { ascending: false });
  if (error) throw new Error("No se pudo cargar el resumen.");
  return (
    <main className="workspace">
      <Link className="text-link" href={`/u/${username}`}>
        ← {p.name || p.username}
      </Link>
      <div className="eyebrow spaced-eyebrow">SOMEWHERE / RESUMEN</div>
      <h1>
        Todo lo
        <br />
        <em>recorrido.</em>
      </h1>
      <p className="intro">
        La historia pública de {p.name || p.username}, hasta ahora.
      </p>
      <div className="summary-total">
        <strong>{data.length}</strong>
        <span>EXPERIENCIAS PÚBLICAS</span>
      </div>
      <div className="summary-grid">
        {Object.entries(experienceTypes).map(([type, label]) => (
          <div key={type}>
            <strong>{data.filter((e) => e.type === type).length}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <section className="panel">
        <h2>Actividad reciente</h2>
        {data.length ? (
          data.slice(0, 5).map((e) => (
            <div className="activity-row" key={e.id}>
              <span>{experienceTypes[e.type as ExperienceType]}</span>
              <div>
                <strong>{e.name}</strong>
                <p>{e.place}</p>
              </div>
              <time dateTime={e.experience_date}>
                {formatDate(e.experience_date)}
              </time>
            </div>
          ))
        ) : (
          <p>Todavía no hay actividad pública.</p>
        )}
      </section>
      <Link className="button" href={`/u/${username}/experiences`}>
        Ver experiencias <span className="arrow" />
      </Link>
    </main>
  );
}
