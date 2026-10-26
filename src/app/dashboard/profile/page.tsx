import Link from "next/link";
import { requireUser } from "@/lib/supabase/server";
import { saveProfile } from "@/lib/profile-actions";
import { ActionForm } from "@/components/forms";
export default async function EditProfile() {
  const { supabase, user } = await requireUser();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("username,name,bio,city,social_link")
    .eq("user_id", user.id)
    .single();
  if (error) throw new Error("No se pudo cargar tu perfil.");
  return (
    <main className="workspace">
      <div className="eyebrow">TU ESPACIO / PERFIL</div>
      <div className="section-heading">
        <h1>
          Lo que
          <br />
          <em>eres.</em>
        </h1>
        <Link href={`/u/${profile.username}`} className="text-link">
          Ver perfil público <span className="arrow" />
        </Link>
      </div>
      <p className="intro">
        Estos datos serán visibles para quien abra tu tag.
      </p>
      <ActionForm action={saveProfile}>
        <label className="field">
          Nombre
          <input
            name="name"
            required
            maxLength={80}
            defaultValue={profile.name}
            autoComplete="name"
          />
        </label>
        <label className="field">
          Nombre de usuario
          <input
            name="username"
            required
            minLength={3}
            maxLength={30}
            pattern="[a-z0-9_]+"
            defaultValue={profile.username}
            autoComplete="username"
          />
          <span className="hint">Tu dirección pública: /u/tu_usuario</span>
        </label>
        <label className="field">
          Ciudad
          <input
            name="city"
            maxLength={100}
            defaultValue={profile.city}
            autoComplete="address-level2"
          />
        </label>
        <label className="field">
          Bio
          <textarea
            name="bio"
            maxLength={400}
            rows={4}
            defaultValue={profile.bio}
          />
        </label>
        <label className="field">
          Enlace social
          <input
            name="social_link"
            type="url"
            maxLength={500}
            placeholder="https://"
            defaultValue={profile.social_link || ""}
          />
        </label>
        <label className="field">
          Foto de perfil
          <input
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
          />
          <span className="hint">
            JPG, PNG o WebP. Máximo 5 MB. Tu foto será pública.
          </span>
        </label>
      </ActionForm>
    </main>
  );
}
