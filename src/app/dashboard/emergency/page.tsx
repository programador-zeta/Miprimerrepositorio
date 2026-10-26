import Link from "next/link";
import { requireUser } from "@/lib/supabase/server";
import { saveEmergency, clearEmergency } from "@/lib/emergency-actions";
import { ActionForm } from "@/components/forms";
export default async function EditEmergency() {
  const { supabase, user } = await requireUser();
  const [{ data: p }, { data: e, error }] = await Promise.all([
    supabase
      .from("profiles")
      .select("username")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("emergency_profiles")
      .select("emergency_name,emergency_phone,allergies,medications,notes")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);
  if (error) throw new Error("No pudimos cargar tu información.");
  return (
    <main className="workspace">
      <div className="eyebrow">TU ESPACIO / EMERGENCIA</div>
      <div className="section-heading">
        <h1>
          Por si
          <br />
          <em>hace falta.</em>
        </h1>
        {p && (
          <Link className="text-link" href={`/u/${p.username}/emergency`}>
            Ver página de emergencia <span className="arrow" />
          </Link>
        )}
      </div>
      <p className="intro">
        Comparte solo lo que necesites. Los campos médicos son opcionales. Esta
        información será pública para quien abra tu perfil o tag.
      </p>
      <ActionForm action={saveEmergency}>
        <label className="field">
          Contacto de emergencia
          <input
            name="emergency_name"
            maxLength={100}
            defaultValue={e?.emergency_name || ""}
            autoComplete="off"
          />
        </label>
        <label className="field">
          Teléfono del contacto
          <input
            name="emergency_phone"
            type="tel"
            maxLength={30}
            placeholder="+52…"
            defaultValue={e?.emergency_phone || ""}
            autoComplete="off"
          />
        </label>
        <label className="field">
          Alergias (opcional)
          <textarea
            name="allergies"
            rows={3}
            maxLength={500}
            defaultValue={e?.allergies || ""}
          />
        </label>
        <label className="field">
          Medicamentos (opcional)
          <textarea
            name="medications"
            rows={3}
            maxLength={500}
            defaultValue={e?.medications || ""}
          />
        </label>
        <label className="field">
          Notas importantes (opcional)
          <textarea
            name="notes"
            rows={4}
            maxLength={1500}
            defaultValue={e?.notes || ""}
          />
        </label>
        <label className="checkbox-field">
          <input type="checkbox" name="consent" value="yes" required /> Entiendo
          que estos datos serán visibles públicamente y tengo permiso para
          compartir el contacto.
        </label>
      </ActionForm>
      {e && (
        <form action={clearEmergency} className="danger-zone">
          <button className="text-button">
            Eliminar mi información de emergencia pública
          </button>
        </form>
      )}
    </main>
  );
}
