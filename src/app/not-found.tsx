import Link from "next/link";
export default function NotFound() {
  return (
    <main className="state-wrap">
      <section className="state-card">
        <div className="eyebrow">404 · FUERA DEL CAMINO</div>
        <h1>
          Por aquí
          <br />
          <em>todavía no.</em>
        </h1>
        <p>
          No encontramos este tag o esta página. Comprueba la dirección de tu
          etiqueta.
        </p>
        <Link className="button" href="/">
          Volver al inicio <span className="arrow" aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}
