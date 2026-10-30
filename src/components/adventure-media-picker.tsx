"use client";
import Image from "next/image";
import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import {
  MAX_MEDIA,
  experienceMediaUrl,
  validateMediaFile,
  type ExperienceMedia,
} from "@/lib/experience-media";
export type SelectedFile = { id: string; file: File; url: string };
export function AdventureMediaPicker({
  existing,
  onExistingChange,
  files,
  onFilesChange,
  disabled,
}: {
  existing: ExperienceMedia[];
  onExistingChange: (items: ExperienceMedia[]) => void;
  files: SelectedFile[];
  onFilesChange: (items: SelectedFile[]) => void;
  disabled: boolean;
}) {
  const id = useId();
  const [error, setError] = useState("");
  const urls = useRef(new Set<string>());
  useEffect(() => {
    const saved = urls.current;
    return () => saved.forEach((url) => URL.revokeObjectURL(url));
  }, []);
  useEffect(() => {
    const active = new Set(files.map((f) => f.url));
    for (const url of urls.current)
      if (!active.has(url)) {
        URL.revokeObjectURL(url);
        urls.current.delete(url);
      }
  }, [files]);
  function select(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files || []);
    event.target.value = "";
    if (selected.length + existing.length + files.length > MAX_MEDIA) {
      setError("Puedes añadir hasta 10 fotos y videos por aventura.");
      return;
    }
    for (const file of selected) {
      const issue = validateMediaFile(file.type, file.size);
      if (issue) {
        setError(issue);
        return;
      }
    }
    setError("");
    onFilesChange([
      ...files,
      ...selected.map((file) => {
        const url = URL.createObjectURL(file);
        urls.current.add(url);
        return { id: crypto.randomUUID(), file, url };
      }),
    ]);
  }
  const count = existing.length + files.length;
  const previews = [
    ...existing.map((item, index) => ({
      id: item.path,
      url: experienceMediaUrl(item.path),
      video: item.kind === "video",
      remove: () => onExistingChange(existing.filter((_, i) => i !== index)),
    })),
    ...files.map((item) => ({
      id: item.id,
      url: item.url,
      video: item.file.type.startsWith("video/"),
      remove: () => onFilesChange(files.filter((f) => f.id !== item.id)),
    })),
  ];
  return (
    <fieldset className="media-picker" disabled={disabled}>
      <legend>Fotos y videos de tu aventura</legend>
      <p className="hint" id={`${id}-help`}>
        Hasta 10 archivos. Fotos JPG, PNG o WebP de hasta 5 MB; videos MP4, WebM
        o MOV de hasta 25 MB. La reproducción depende del formato compatible con
        tu dispositivo.
      </p>
      {count > 0 && (
        <div className="media-previews">
          {previews.map((item, index) => (
            <div className="media-preview" key={item.id}>
              {item.video ? (
                <video
                  src={item.url}
                  preload="metadata"
                  muted
                  playsInline
                  aria-label={`Vista previa del video ${index + 1}`}
                />
              ) : (
                <Image
                  src={item.url}
                  alt={`Vista previa de la foto ${index + 1}`}
                  fill
                  unoptimized
                  sizes="120px"
                />
              )}
              <span className="preview-number">
                {index + 1}
                {item.video ? " · Video" : ""}
              </span>
              <button
                type="button"
                className="remove-media"
                aria-label={`Quitar archivo ${index + 1}`}
                onClick={item.remove}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <label className={`upload-zone ${disabled ? "is-disabled" : ""}`}>
        <span className="upload-symbol" aria-hidden="true">
          +
        </span>
        <strong>
          {count ? "Añadir más recuerdos" : "Elige tus fotos y videos"}
        </strong>
        <span>
          {count} / {MAX_MEDIA} archivos · Puedes seleccionar varios
        </span>
        <input
          type="file"
          aria-label="Fotos y videos"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
          multiple
          onChange={select}
          disabled={disabled || count >= MAX_MEDIA}
          aria-describedby={`${id}-help`}
        />
      </label>
      {error && (
        <p className="notice" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
