"use client";

import Link from "next/link";
import { useState } from "react";
import { IconClose, IconMenu } from "@/components/landing/icons";
import LogoutButton from "./LogoutButton";

interface NavItem {
  href: string;
  label: string;
}

export default function AdminNav({ navItems, email }: { navItems: NavItem[]; email: string }) {
  const [open, setOpen] = useState(false);

  const linkClass =
    "block rounded-md px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-900 hover:text-white";

  return (
    <>
      <header className="flex items-center justify-between border-b border-neutral-800 p-4 md:hidden">
        <p className="text-sm text-neutral-500">CineRejon Admin</p>
        <button
          type="button"
          aria-label={open ? "Cerrar menu" : "Abrir menu"}
          onClick={() => setOpen((v) => !v)}
          className="text-neutral-300"
        >
          {open ? <IconClose className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
        </button>
      </header>

      {open && (
        <div className="border-b border-neutral-800 p-4 md:hidden">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={linkClass}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 space-y-3 border-t border-neutral-800 pt-4">
            <p className="text-xs text-neutral-500">{email}</p>
            <LogoutButton />
          </div>
        </div>
      )}

      <aside className="hidden w-56 shrink-0 border-r border-neutral-800 p-4 md:block">
        <p className="mb-6 text-sm text-neutral-500">CineRejon Admin</p>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 space-y-3 border-t border-neutral-800 pt-4">
          <p className="text-xs text-neutral-500">{email}</p>
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
