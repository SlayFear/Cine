"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconClose, IconMenu } from "./icons";

const NAV_LINKS = [
  { href: "#inicio", label: "Inicio" },
  { href: "#informacion", label: "Información" },
  { href: "#trailer", label: "Trailer" },
  { href: "#sinopsis", label: "Sinopsis" },
  { href: "#contacto", label: "Contacto" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? "border-b border-cine-border bg-cine-bg/95 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <a href="#inicio" className="text-lg font-bold tracking-[0.2em] text-cine-text">
          LA <span className="text-cine-red">CAPTURA</span>
        </a>

        <ul className="hidden items-center gap-9 text-xs font-semibold tracking-[0.15em] text-cine-muted md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="transition-colors hover:text-cine-text">
                {link.label.toUpperCase()}
              </a>
            </li>
          ))}
        </ul>

        <Link
          href="/funciones"
          className="hidden rounded-md bg-cine-red px-5 py-2.5 text-xs font-bold tracking-wider text-cine-text transition hover:shadow-[0_0_25px_-5px_rgba(229,9,20,0.8)] md:inline-block"
        >
          CONFIRMAR INVITACIÓN
        </Link>

        <button
          type="button"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((v) => !v)}
          className="text-cine-text md:hidden"
        >
          {open ? <IconClose className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-t border-cine-border md:hidden"
          >
            <ul className="flex flex-col gap-1 px-6 py-4 text-sm font-medium tracking-wide text-cine-muted">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-2 py-3 transition-colors hover:bg-white/5 hover:text-cine-text"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="pt-2">
                <Link
                  href="/funciones"
                  className="block rounded-md bg-cine-red px-4 py-3 text-center text-xs font-bold tracking-wider text-cine-text"
                >
                  CONFIRMAR INVITACIÓN
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
