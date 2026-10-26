import Link from "next/link";
import { getPublicProfile } from "@/lib/profile";
import { publicSupabase } from "@/lib/supabase/server";
import { ExperienceCard } from "@/components/experience-card";
import type { Experience } from "@/lib/experiences";
export const dynamic = "force-dynamic";
export default async function PublicExperiences({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params,
    p = await getPublicProfile(username);
  const { data, error } = await publicSupabase()
    .from("experiences")
    .select("id,type,name,place,experience_date,photo_url,note,visibility")
    .eq("user_id", p.user_id)
    .eq("visibility", "public")
    .order("experience_date", { ascending: false });
  if (error) throw new Error("No se pudo cargar la colección.");
  return (
    <main className="workspace">
      <Link className="text-link" href={`/u/${username}`}>
        ← {p.name || p.username}
      </Link>
      <div className="eyebrow spaced-eyebrow">SOMEWHERE / EXPERIENCIAS</div>
      <h1>
        Lugares que
        <br />
        <em>se quedan.</em>
      </h1>
      <div className="section-heading">
        <p className="intro">
          La colección de {p.name || p.username}. Cada lugar, una historia.
        </p>
        <Link className="text-link" href={`/u/${username}/summary`}>
          Ver resumen <span className="arrow" />
        </Link>
      </div>
      {data.length ? (
        <div className="experience-grid">
          {(data as Experience[]).map((e) => (
            <ExperienceCard key={e.id} experience={e} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          Las próximas historias están por llegar. Todavía no hay experiencias
          públicas.
        </div>
      )}
    </main>
  );
}
