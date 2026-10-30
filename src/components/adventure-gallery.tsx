"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  experienceMediaUrl,
  type ExperienceMedia,
} from "@/lib/experience-media";
export function AdventureGallery({
  items,
  name,
  type,
}: {
  items: ExperienceMedia[];
  name: string;
  type: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [current, setCurrent] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);
  useEffect(() => {
    if (expanded !== null) {
      if (!dialog.current?.open) dialog.current?.showModal();
    } else if (dialog.current?.open) dialog.current.close();
  }, [expanded]);
  function go(index: number) {
    const bounded = (index + items.length) % items.length;
    track.current?.children[bounded]?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "nearest",
      inline: "start",
    });
  }
  function open(index: number) {
    track.current?.querySelectorAll("video").forEach((video) => video.pause());
    setExpanded(index);
  }
  return (
    <div
      className="adventure-gallery"
      role="region"
      aria-label={`Galería de ${name}`}
    >
      <div
        className="gallery-track"
        ref={track}
        onScroll={() => {
          const el = track.current;
          if (!el) return;
          const index = Math.round(el.scrollLeft / el.clientWidth);
          setCurrent(index);
          el.querySelectorAll("video").forEach((video) => {
            if (Number(video.dataset.slide) !== index) video.pause();
          });
        }}
      >
        {items.length ? (
          items.map((item, index) => (
            <div
              className="gallery-slide"
              key={item.path}
              role="group"
              aria-label={`${index + 1} de ${items.length}`}
            >
              {item.kind === "video" ? (
                <video
                  data-slide={index}
                  src={experienceMediaUrl(item.path)}
                  controls
                  playsInline
                  preload="metadata"
                  aria-label={`${name}, video ${index + 1}`}
                />
              ) : (
                <button
                  type="button"
                  className="gallery-image-button"
                  onClick={() => open(index)}
                  aria-label={`Ampliar foto ${index + 1} de ${name}`}
                >
                  <Image
                    src={experienceMediaUrl(item.path)}
                    alt={`${name}, foto ${index + 1}`}
                    fill
                    unoptimized
                    sizes="(max-width:700px) 90vw, 480px"
                  />
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="gallery-slide">
            <span className="empty-photo">TU PRÓXIMO RECUERDO</span>
          </div>
        )}
      </div>
      <span className="experience-type">{type}</span>
      {items.length > 0 && (
        <button
          className="gallery-expand"
          type="button"
          onClick={() => open(current)}
          aria-label={`Abrir galería de ${name}`}
        >
          <span className="arrow" aria-hidden="true" />
        </button>
      )}
      {items.length > 1 && (
        <>
          <div className="gallery-arrows">
            <button
              type="button"
              onClick={() => go(current - 1)}
              aria-label={`Archivo anterior de ${name}`}
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => go(current + 1)}
              aria-label={`Siguiente archivo de ${name}`}
            >
              →
            </button>
          </div>
          <div
            className="gallery-pagination"
            aria-label="Archivos de la aventura"
          >
            {items.map((item, index) => (
              <button
                type="button"
                key={item.path}
                className={index === current ? "active" : ""}
                onClick={() => go(index)}
                aria-label={`Ver archivo ${index + 1} de ${name}`}
                aria-current={index === current ? "true" : undefined}
              />
            ))}
          </div>
          <span className="gallery-count" aria-live="polite">
            {current + 1} / {items.length}
          </span>
        </>
      )}
      <dialog
        ref={dialog}
        className="gallery-lightbox"
        aria-label={`Recuerdos de ${name}`}
        onClose={() => setExpanded(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setExpanded(null);
        }}
      >
        {expanded !== null && items[expanded] && (
          <div className="lightbox-content">
            <div className="lightbox-toolbar">
              <span>
                {name} · {expanded + 1} / {items.length}
              </span>
              <button
                type="button"
                onClick={() => setExpanded(null)}
                aria-label="Cerrar galería"
              >
                ×
              </button>
            </div>
            <div className="lightbox-media">
              {items[expanded].kind === "video" ? (
                <video
                  key={items[expanded].path}
                  src={experienceMediaUrl(items[expanded].path)}
                  controls
                  playsInline
                  preload="metadata"
                  aria-label={`Video de ${name}`}
                />
              ) : (
                <Image
                  key={items[expanded].path}
                  src={experienceMediaUrl(items[expanded].path)}
                  alt={`${name}, foto ${expanded + 1}`}
                  fill
                  unoptimized
                  sizes="95vw"
                />
              )}
            </div>
            {items.length > 1 && (
              <div className="lightbox-navigation">
                <button
                  type="button"
                  onClick={() =>
                    setExpanded((expanded + items.length - 1) % items.length)
                  }
                >
                  ← Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setExpanded((expanded + 1) % items.length)}
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        )}
      </dialog>
    </div>
  );
}
