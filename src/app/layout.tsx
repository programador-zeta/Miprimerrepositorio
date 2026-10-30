import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
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
          <Link
            href="/"
            className="wordmark brand-logo"
            aria-label="Somewhere, inicio"
          >
            <Image
              src="/brand/somewhere-logo-clean.webp"
              alt="Somewhere"
              width={2172}
              height={724}
              sizes="(max-width:700px) 175px, 230px"
              preload
            />
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
