import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

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
    <div className="flex min-h-screen bg-neutral-950 text-neutral-100">
      <aside className="w-56 shrink-0 border-r border-neutral-800 p-4">
        <p className="mb-6 text-sm text-neutral-500">CineRejon Admin</p>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-900 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 space-y-3 border-t border-neutral-800 pt-4">
          <p className="text-xs text-neutral-500">{session.email}</p>
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
