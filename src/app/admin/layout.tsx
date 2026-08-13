import { getAdminSession } from "@/lib/auth";
import AdminNav from "./AdminNav";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/pelicula", label: "Pelicula" },
  { href: "/admin/funciones", label: "Funciones" },
  { href: "/admin/scanner", label: "Escaner taquilla" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  if (!session) {
    // La cookie no es valida (expirada, etc). El middleware ya cubre el caso
    // general, esto es un respaldo minimo por si se renderiza sin pasar por el.
    return <main className="min-h-screen bg-neutral-950">{children}</main>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100 md:flex-row">
      <AdminNav navItems={NAV_ITEMS} email={session.email} />
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
