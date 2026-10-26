"use server";
import { requireUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { FormState } from "@/lib/auth-actions";
export async function saveEmergency(
  _: FormState,
  form: FormData,
): Promise<FormState> {
  const { supabase, user } = await requireUser();
  if (form.get("consent") !== "yes")
    return {
      error:
        "Confirma que quieres compartir estos datos en tu página de emergencia.",
    };
  const fields = [
    "emergency_name",
    "emergency_phone",
    "allergies",
    "medications",
    "notes",
  ] as const;
  const data = Object.fromEntries(
    fields.map((k) => [k, String(form.get(k) || "").trim()]),
  );
  if (fields.some((k) => data[k].length > (k === "notes" ? 1500 : 500)))
    return { error: "Uno de los campos es demasiado largo." };
  const phone = data.emergency_phone.replace(/[^+\d]/g, "");
  if (data.emergency_phone && !/^\+?\d{7,15}$/.test(phone))
    return {
      error:
        "Introduce un teléfono válido, con código de país si es necesario.",
    };
  if (phone && !data.emergency_name)
    return { error: "Añade el nombre de tu contacto de emergencia." };
  const { error } = await supabase
    .from("emergency_profiles")
    .upsert(
      { ...data, emergency_phone: phone, user_id: user.id },
      { onConflict: "user_id" },
    );
  if (error)
    return { error: "No pudimos guardar la información de emergencia." };
  revalidatePath("/dashboard/emergency");
  return { success: "Información de emergencia guardada." };
}
export async function clearEmergency(): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("emergency_profiles")
    .delete()
    .eq("user_id", user.id);
  if (error) throw new Error("No se pudo eliminar la información.");
  revalidatePath("/dashboard/emergency");
}
