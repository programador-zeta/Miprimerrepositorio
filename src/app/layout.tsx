import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
export const metadata: Metadata = {
  title: "SOMEWHERE — Take your story outside",
  description:
    "Un objeto pequeño. Un mundo por descubrir. Tu Somewhere Tag conecta contigo.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <header className="site-header">
          <Link href="/" className="wordmark" aria-label="Somewhere, inicio">
            SOMEWHERE<span className="brand-dot">®</span>
          </Link>
          <span className="header-note">GO OUT. BE SOMEWHERE.</span>
          <Link className="header-link" href="/dashboard">
            Mi espacio <span className="arrow" aria-hidden="true" />
          </Link>
        </header>
        {children}
        <footer className="site-footer">
          <Link href="/" className="footer-logo">
            SOMEWHERE®
          </Link>
          <span>HECHO PARA ESTAR AFUERA.</span>
          <span>EST. 2026 · MÉXICO</span>
        </footer>
      </body>
    </html>
  );
}
