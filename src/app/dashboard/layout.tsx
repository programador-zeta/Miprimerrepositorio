import Link from "next/link";
import { requireUser } from "@/lib/supabase/server";
import { logout } from "@/lib/auth-actions";
export const metadata = {
  title: "Tu espacio — SOMEWHERE",
  robots: { index: false, follow: false },
};
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  return (
    <div className="dashboard-shell">
      <nav className="dashboard-nav" aria-label="Panel privado">
        <Link href="/dashboard">Mi espacio</Link>
        <Link href="/dashboard/profile">Perfil</Link>
        <Link href="/dashboard/emergency">Emergencia</Link>
        <Link href="/dashboard/experiences">Experiencias</Link>
        <Link href="/dashboard/tags">Tags</Link>
        <form action={logout}>
          <button>Cerrar sesión</button>
        </form>
      </nav>
      {children}
    </div>
  );
}
