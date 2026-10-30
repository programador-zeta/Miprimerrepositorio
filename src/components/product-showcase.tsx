"use client";
import Image from "next/image";
import { useState } from "react";
const finishes = [
  { name: "Azul", image: "/brand/tag-blue-cutout.webp", color: "#315e86" },
  { name: "Verde", image: "/brand/tag-green-cutout.webp", color: "#667d48" },
];
export function ProductShowcase() {
  const [selected, setSelected] = useState(0);
  const finish = finishes[selected];
  return (
    <div
      className="product-showcase"
      style={
        {
          "--product-glow": selected === 0 ? "#2876c1" : "#7ca84c",
        } as React.CSSProperties
      }
    >
      <div className="product-orbit" aria-hidden="true" />
      <div className="product-photo">
        <Image
          key={finish.image}
          src={finish.image}
          alt={`Boceto del Somewhere Tag ${finish.name.toLowerCase()}`}
          fill
          sizes="(max-width:700px) 260px, 380px"
          preload
        />
      </div>
      <div className="product-ground-shadow" aria-hidden="true" />
      <div className="finish-picker" role="group" aria-label="Color del tag">
        {finishes.map((item, index) => (
          <button
            key={item.name}
            type="button"
            aria-label={`Ver tag ${item.name.toLowerCase()}`}
            aria-pressed={selected === index}
            onClick={() => setSelected(index)}
            style={{ "--finish": item.color } as React.CSSProperties}
          >
            <span />
          </button>
        ))}
        <span className="finish-name" aria-live="polite">
          {finish.name}
        </span>
      </div>
      <span className="product-caption">SOMEWHERE / NFC TAG</span>
    </div>
  );
}
