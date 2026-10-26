"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="state-wrap">
      <section className="state-card">
        <div className="eyebrow">UN MOMENTO EN EL CAMINO</div>
        <h1>
          Volvamos
          <br />
          <em>a intentarlo.</em>
        </h1>
        <p>No pudimos cargar esta página. Tus datos siguen guardados.</p>
        <button onClick={reset} className="button">
          Volver a intentar
        </button>
      </section>
    </main>
  );
}
