"use client";
import { useState } from "react";
import { ExperienceCard } from "@/components/experience-card";
import { experienceTypes, type Experience } from "@/lib/experiences";
export function AdventureCollection({
  experiences,
}: {
  experiences: Experience[];
}) {
  const [type, setType] = useState("all");
  const [search, setSearch] = useState("");
  const types = Object.entries(experienceTypes).filter(([key]) =>
    experiences.some((e) => e.type === key),
  );
  const visible = experiences.filter(
    (e) =>
      (type === "all" || e.type === type) &&
      `${e.name} ${e.place}`
        .toLocaleLowerCase("es")
        .includes(search.toLocaleLowerCase("es")),
  );
  return (
    <>
      <div className="collection-tools">
        <div
          className="filter-chips"
          role="group"
          aria-label="Filtrar aventuras por tipo"
        >
          <button
            type="button"
            aria-pressed={type === "all"}
            onClick={() => setType("all")}
          >
            Todas <span>{experiences.length}</span>
          </button>
          {types.map(([key, label]) => (
            <button
              type="button"
              key={key}
              aria-pressed={type === key}
              onClick={() => setType(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="collection-search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            aria-label="Buscar aventuras"
            placeholder="Busca un lugar o un recuerdo"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>
      <p className="collection-count" role="status">
        {visible.length}{" "}
        {visible.length === 1
          ? "aventura para descubrir"
          : "aventuras para descubrir"}
      </p>
      {visible.length ? (
        <div className="experience-grid">
          {visible.map((e) => (
            <ExperienceCard key={e.id} experience={e} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          No hay aventuras con ese filtro. Prueba con otro lugar o tipo.
        </div>
      )}
    </>
  );
}
