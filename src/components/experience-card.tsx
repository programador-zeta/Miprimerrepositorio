import { AdventureGallery } from "@/components/adventure-gallery";
import { experienceMedia } from "@/lib/experience-media";
import {
  experienceTypes,
  formatDate,
  type Experience,
} from "@/lib/experiences";
export function ExperienceCard({ experience: e }: { experience: Experience }) {
  return (
    <article className="experience-card">
      <AdventureGallery
        items={experienceMedia(e)}
        name={e.name}
        type={experienceTypes[e.type]}
      />
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
