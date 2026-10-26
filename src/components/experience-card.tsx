import Image from "next/image";
import { mediaUrl } from "@/lib/profile";
import {
  experienceTypes,
  formatDate,
  type Experience,
} from "@/lib/experiences";
export function ExperienceCard({ experience: e }: { experience: Experience }) {
  const photo = mediaUrl("experience-photos", e.photo_url);
  return (
    <article className="experience-card">
      <div className="experience-photo">
        {photo ? (
          <Image
            src={photo}
            alt={e.name}
            fill
            unoptimized
            sizes="(max-width:700px) 90vw, 400px"
          />
        ) : (
          <span className="empty-photo">SIN FOTOGRAFÍA</span>
        )}
        <span className="experience-type">{experienceTypes[e.type]}</span>
      </div>
      <div className="experience-meta">
        <span>{e.place}</span>
        <time dateTime={e.experience_date}>
          {formatDate(e.experience_date)}
        </time>
      </div>
      <h2>{e.name}</h2>
      {e.note && <p>{e.note}</p>}
    </article>
  );
}
