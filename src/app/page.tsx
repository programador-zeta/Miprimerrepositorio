import Link from "next/link";
export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">UN OBJETO PEQUEÑO. UN MUNDO AFUERA.</div>
          <h1>
            Tu historia.
            <br />
            En cualquier
            <br />
            <em>lugar.</em>
          </h1>
          <p className="intro">
            Lleva lo que eres a donde vayas. Un tag que conecta tus aventuras,
            tu gente y tu historia.
          </p>
          <Link href="/t/SW0001" className="button">
            Descubre tu Somewhere <span className="arrow" aria-hidden="true" />
          </Link>
          <div className="hero-bottom">
            <span className="cross" aria-hidden="true">
              +
            </span>
            <span className="tiny">
              Sin batería. Sin aplicaciones.
              <br />
              Solo tú y el siguiente destino.
            </span>
          </div>
        </div>
        <div
          className="landscape"
          role="img"
          aria-label="Cumbres de montaña entre nubes"
        >
          <span className="photo-label">THE WORLD IS STILL OUT THERE.</span>
          <div className="tag-object" aria-hidden="true">
            <strong>SOMEWHERE®</strong>
            <span className="tag-mark arrow" />
            <span>TAKE YOUR STORY OUTSIDE.</span>
          </div>
          <div className="photo-caption">
            <span>01 / A LITTLE FURTHER</span>
            <span>SIEMPRE HAY OTRO LUGAR</span>
          </div>
        </div>
      </section>
      <section className="manifesto">
        <div className="eyebrow">MENOS PANTALLA. MÁS MUNDO.</div>
        <p>
          Hay historias que no caben en un feed.{" "}
          <span>Sal a vivirlas. Llévalas contigo.</span>
        </p>
      </section>
    </main>
  );
}
