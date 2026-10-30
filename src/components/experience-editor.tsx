"use client";
import { useActionState, useState } from "react";
import { saveExperience } from "@/lib/experience-actions";
import { prepareMediaUpload, discardPendingMedia } from "@/lib/media-actions";
import { experienceTypes, type Experience } from "@/lib/experiences";
import { experienceMedia, type ExperienceMedia } from "@/lib/experience-media";
import type { FormState } from "@/lib/auth-actions";
import { Feedback } from "@/components/forms";
import {
  AdventureMediaPicker,
  type SelectedFile,
} from "@/components/adventure-media-picker";
export function ExperienceEditor({ experience }: { experience?: Experience }) {
  const [existing, setExisting] = useState(
    experience ? experienceMedia(experience) : [],
  );
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const emptyDraft = {
    type: "hike",
    experience_date: "",
    name: "",
    place: "",
    note: "",
    visibility: "private",
  };
  const [draft, setDraft] = useState(
    experience
      ? {
          type: experience.type,
          experience_date: experience.experience_date,
          name: experience.name,
          place: experience.place,
          note: experience.note || "",
          visibility: experience.visibility,
        }
      : emptyDraft,
  );
  function updateDraft(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    setDraft((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  }
  const [progress, setProgress] = useState("");
  const [state, submit, pending] = useActionState(
    async (_: FormState, form: FormData): Promise<FormState> => {
      if (!existing.length && !files.length)
        return { error: "Añade al menos una foto o video." };
      const uploaded: ExperienceMedia[] = [];
      try {
        for (const [index, item] of files.entries()) {
          setProgress(`Subiendo recuerdo ${index + 1} de ${files.length}…`);
          const result = await prepareMediaUpload(
            item.file.type,
            item.file.size,
          );
          if (result.error || !result.signedUrl || !result.media)
            throw new Error(result.error || "No pudimos preparar la subida.");
          // Track even incomplete attempts so failed uploads can be cleaned up.
          uploaded.push(result.media);
          const response = await fetch(result.signedUrl, {
            method: "PUT",
            headers: { "Content-Type": item.file.type, "x-upsert": "false" },
            body: item.file,
          });
          if (!response.ok)
            throw new Error(
              "No pudimos subir un archivo. Revisa tu conexión e inténtalo de nuevo.",
            );
        }
        setProgress("Guardando tu aventura…");
        const media = [...existing, ...uploaded];
        form.set("media", JSON.stringify(media));
        const saved = await saveExperience({}, form);
        if (saved.error) {
          await discardPendingMedia(uploaded);
          return saved;
        }
        setExisting(experience ? media : []);
        setFiles([]);
        if (!experience) setDraft(emptyDraft);
        return saved;
      } catch (error) {
        try {
          await discardPendingMedia(uploaded);
        } catch {
          /* A retry can recover after connectivity returns. */
        }
        return {
          error:
            error instanceof Error
              ? error.message
              : "No pudimos guardar la aventura. Inténtalo de nuevo.",
        };
      } finally {
        setProgress("");
      }
    },
    {},
  );
  return (
    <form
      action={submit}
      className="editor-form adventure-editor"
      aria-busy={pending}
    >
      <fieldset disabled={pending} className="editor-fields">
        <input type="hidden" name="id" value={experience?.id || ""} />
        <div className="form-grid">
          <label className="field">
            Tipo
            <select
              aria-label="Tipo"
              name="type"
              value={draft.type}
              onChange={updateDraft}
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
              value={draft.experience_date}
              onChange={updateDraft}
            />
          </label>
        </div>
        <label className="field">
          Nombre de la experiencia
          <input
            name="name"
            required
            maxLength={120}
            value={draft.name}
            onChange={updateDraft}
            placeholder="Ese lugar al que volverías"
          />
        </label>
        <label className="field">
          Lugar
          <input
            name="place"
            required
            maxLength={160}
            value={draft.place}
            onChange={updateDraft}
            placeholder="¿Dónde fue la aventura?"
          />
        </label>
        <AdventureMediaPicker
          existing={existing}
          onExistingChange={setExisting}
          files={files}
          onFilesChange={setFiles}
          disabled={pending}
        />
        <label className="field">
          Nota (opcional)
          <textarea
            name="note"
            rows={3}
            maxLength={1500}
            value={draft.note}
            onChange={updateDraft}
            placeholder="Lo que no quieres olvidar…"
          />
        </label>
        <label className="field">
          Visibilidad
          <select
            aria-label="Visibilidad"
            name="visibility"
            value={draft.visibility}
            onChange={updateDraft}
          >
            <option value="private">Privada — solo tú</option>
            <option value="public">Pública — visible en tu perfil</option>
          </select>
        </label>
      </fieldset>
      <Feedback state={pending ? {} : state} />
      {pending && (
        <p className="upload-progress" role="status">
          {progress || "Preparando tu aventura…"}
        </p>
      )}
      <button className="button" disabled={pending}>
        {pending
          ? "Guardando…"
          : experience
            ? "Guardar experiencia"
            : "Crear experiencia"}
        <span className="arrow" aria-hidden="true" />
      </button>
    </form>
  );
}
