import Link from "next/link";
import Image from "next/image";
import { getPublicProfile, mediaUrl } from "@/lib/profile";
import { publicSupabase } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Emergencia — SOMEWHERE",
  robots: { index: false, follow: false },
};
export default async function Emergency({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params,
    p = await getPublicProfile(username);
  const { data: e, error } = await publicSupabase()
    .from("emergency_profiles")
    .select("emergency_name,emergency_phone,allergies,medications,notes")
    .eq("user_id", p.user_id)
    .maybeSingle();
  if (error) throw new Error("No se pudo cargar la información de emergencia.");
  const photo = mediaUrl("avatars", p.profile_photo),
    phone = e?.emergency_phone?.replace(/[^+\d]/g, "");
  return (
    <main className="emergency-page">
      <Link href={`/u/${username}`} className="text-link">
        ← Volver al perfil
      </Link>
      <div className="eyebrow emergency-eyebrow">INFORMACIÓN DE EMERGENCIA</div>
      <div className="emergency-identity">
        {photo && (
          <Image
            src={photo}
            width={88}
            height={88}
            alt={`Foto de ${p.name || p.username}`}
            unoptimized
          />
        )}
        <div>
          <h1>{p.name || p.username}</h1>
          {p.city && <p>{p.city}</p>}
        </div>
      </div>
      <section className="emergency-contact">
        <span className="eyebrow">CONTACTO DE EMERGENCIA</span>
        <h2>{e?.emergency_name || "Sin contacto registrado"}</h2>
        {phone ? (
          <>
            <a href={`tel:${phone}`} className="phone-number">
              {e?.emergency_phone}
            </a>
            <a href={`tel:${phone}`} className="button call-button">
              Llamar ahora <span>+</span>
            </a>
          </>
        ) : (
          <p>El propietario todavía no ha añadido un teléfono de contacto.</p>
        )}
      </section>
      <dl className="medical-info">
        {[
          ["Alergias", e?.allergies],
          ["Medicamentos", e?.medications],
          ["Notas importantes", e?.notes],
        ].map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value || "No especificado por el propietario."}</dd>
          </div>
        ))}
      </dl>
      <p className="emergency-footnote">
        Información proporcionada por el propietario. En una emergencia,
        contacta también con los servicios de emergencia de tu zona.
      </p>
    </main>
  );
}
