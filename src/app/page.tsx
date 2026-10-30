import Image from "next/image";
import Link from "next/link";
import { ProductShowcase } from "@/components/product-showcase";
export default function Home() {
  return (
    <main className="somewhere-home">
      <section className="product-hero" aria-labelledby="home-title">
        <div className="product-topline">
          <span>UN OBJETO PEQUEÑO. UN MUNDO AFUERA.</span>
          <a href="#descubre">
            Conoce el tag <span aria-hidden="true">↓</span>
          </a>
        </div>
        <div className="product-stage">
          <div className="product-word" aria-hidden="true">
            Somewhere
          </div>
          <div className="product-story">
            <span className="product-kicker">LLEVA TU MUNDO CONTIGO</span>
            <h1 id="home-title">
              Tu historia.
              <br />
              <em>En cualquier lugar.</em>
            </h1>
            <p>
              Un tag que conecta tus aventuras, tu gente y tu historia. Acerca
              un teléfono compatible y deja que te conozcan.
            </p>
            <Link href="/t/SW0001" className="button">
              Descubre tu Somewhere{" "}
              <span className="arrow" aria-hidden="true" />
            </Link>
          </div>
          <ProductShowcase />
        </div>
        <div className="product-bottomline">
          <span>Sin batería. Sin aplicaciones.</span>
          <span>SOLO TÚ Y EL SIGUIENTE DESTINO.</span>
        </div>
      </section>
      <section
        className="product-details"
        id="descubre"
        aria-labelledby="details-title"
      >
        <div className="product-detail-copy">
          <span className="product-kicker">DISEÑADO PARA IR CONTIGO</span>
          <h2 id="details-title">
            Pequeño por fuera.
            <br />
            <em>Todo tú por dentro.</em>
          </h2>
          <dl className="product-features">
            <div>
              <dt>01 / Tu perfil</dt>
              <dd>Tu nombre, tu historia y los lugares que te hacen ser tú.</dd>
            </div>
            <div>
              <dt>02 / Tus aventuras</dt>
              <dd>Fotos y videos de tus salidas. Tú decides qué compartir.</dd>
            </div>
            <div>
              <dt>03 / Tu gente</dt>
              <dd>
                Un acceso a tu contacto de emergencia cuando alguien lo
                necesita.
              </dd>
            </div>
          </dl>
          <Link className="text-link" href="/dashboard">
            Entra a tu espacio <span className="arrow" aria-hidden="true" />
          </Link>
        </div>
        <div className="product-lifestyle">
          <Image
            src="/brand/tag-backpack-editorial.webp"
            alt="Somewhere Tag azul sujeto a una mochila de aventura"
            fill
            sizes="(max-width:700px) 85vw, 440px"
          />
          <span>HECHO PARA ESTAR AFUERA.</span>
        </div>
      </section>
    </main>
  );
}
