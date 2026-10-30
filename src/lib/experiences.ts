import type { ExperienceMedia } from "@/lib/experience-media";
export const experienceTypes = {
  hike: "Hike",
  bike: "Bike ride",
  run: "Run",
  mountain: "Montaña",
  trip: "Viaje",
  other: "Otro",
} as const;
export type ExperienceType = keyof typeof experienceTypes;
export type Experience = {
  id: string;
  type: ExperienceType;
  name: string;
  place: string;
  experience_date: string;
  photo_url: string | null;
  media?: ExperienceMedia[];
  note: string | null;
  visibility: "public" | "private";
};
export function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date + "T12:00:00Z"));
}
export function validDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const d = new Date(date + "T12:00:00Z");
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === date;
}
