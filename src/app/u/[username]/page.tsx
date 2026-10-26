import Link from "next/link";
import Image from "next/image";
import { getPublicProfile, mediaUrl } from "@/lib/profile";
import { publicSupabase } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params,
    p = await getPublicProfile(username);
  const { data: experiences, error } = await publicSupabase()
    .from("experiences")
    .select("id,type,place")
    .eq("user_id", p.user_id)
    .eq("visibility", "public");
  if (error) throw new Error("No se pudo cargar la actividad pública.");
  const photo = mediaUrl("avatars", p.profile_photo);
  return (
    <main className="public-profile">
      <section className="profile-hero">
        <div className="profile-image">
          {photo ? (
            <Image
              src={photo}
              alt={`Foto de ${p.name || p.username}`}
              loading="eager"
              fill
              unoptimized
              sizes="(max-width:700px) 90vw, 400px"
            />
          ) : (
            <span className="profile-initial">
              {(p.name || p.username).slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className="profile-image-label">A STORY IN PROGRESS.</span>
        </div>
        <div className="profile-copy">
          <div className="eyebrow">SOMEWHERE / @{p.username}</div>
          <h1>
            {p.name || "Mi historia"}
            <span className="city">{p.city || "Siempre en camino."}</span>
          </h1>
          <p className="profile-bio">{p.bio || "Hay mucho por descubrir."}</p>
          <div className="profile-buttons">
            <Link className="button" href="#historia">
              Ver perfil <span className="arrow" />
            </Link>
            <Link
              className="button secondary"
              href={`/u/${p.username}/emergency`}
            >
              Emergencia <span>+</span>
            </Link>
          </div>
          <div className="stats">
            <div>
              <strong>{experiences?.length || 0}</strong>
              <span>EXPERIENCIAS</span>
            </div>
            <div>
              <strong>
                {experiences?.filter((e) =>
                  ["hike", "bike", "run"].includes(e.type),
                ).length || 0}
              </strong>
              <span>RUTAS</span>
            </div>
            <div>
              <strong>
                {experiences?.filter((e) => e.type === "trip").length || 0}
              </strong>
              <span>VIAJES</span>
            </div>
          </div>
        </div>
      </section>
      <section id="historia" className="profile-story">
        <div className="eyebrow">UNA HISTORIA AFUERA</div>
        <h2>
          El mundo es grande.
          <br />
          <em>Sigue explorando.</em>
        </h2>
        <div className="profile-buttons">
          <Link className="button" href={`/u/${username}/experiences`}>
            Ver experiencias <span className="arrow" />
          </Link>
          <Link className="button secondary" href={`/u/${username}/summary`}>
            Mi resumen <span className="arrow" />
          </Link>
        </div>
        {p.social_link && /^https:\/\//i.test(p.social_link) && (
          <a
            href={p.social_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link"
          >
            Encuéntrame aquí <span className="arrow" />
          </a>
        )}
      </section>
    </main>
  );
}
