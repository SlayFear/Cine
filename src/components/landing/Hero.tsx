"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatVenueDate, formatVenueTime } from "@/lib/timezone";
import {
  EVENT_FALLBACK_POSTER,
  EVENT_MAPS_URL,
  EVENT_SUBTITLE,
  EVENT_TAGLINE,
  EVENT_VENUE_CITY,
  EVENT_VENUE_NAME,
} from "@/lib/eventConfig";
import { IconCalendar, IconChevronDown, IconClock, IconLock, IconMapPin } from "./icons";
import Countdown from "./Countdown";

interface HeroProps {
  titulo: string;
  posterUrl: string;
  proximaFuncionISO: string | null;
}

export default function Hero({ titulo, posterUrl, proximaFuncionISO }: HeroProps) {
  const fecha = proximaFuncionISO ? formatVenueDate(proximaFuncionISO) : "Próximamente";
  const hora = proximaFuncionISO ? formatVenueTime(proximaFuncionISO) : "Por confirmar";

  const metaItems = [
    { icon: IconCalendar, label: fecha, href: undefined },
    { icon: IconClock, label: hora, href: undefined },
    { icon: IconMapPin, label: `${EVENT_VENUE_NAME}, ${EVENT_VENUE_CITY}`, href: EVENT_MAPS_URL },
  ];

  return (
    <section id="inicio" className="relative flex min-h-screen w-full items-center overflow-hidden bg-cine-bg">
      <div className="absolute inset-0 lg:left-[42%]">
        <Image
          src={posterUrl || EVENT_FALLBACK_POSTER}
          alt={titulo}
          fill
          preload
          sizes="(min-width: 1024px) 58vw, 100vw"
          className="object-cover object-top opacity-40 lg:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cine-bg via-cine-bg/10 to-cine-bg/60 lg:via-transparent lg:to-transparent" />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-cine-bg via-cine-bg/40 to-transparent lg:block" />
        <div className="absolute inset-0 bg-gradient-to-b from-cine-bg/70 via-transparent to-cine-bg" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-32 pb-24 lg:px-10 lg:pt-40">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="max-w-xl space-y-7">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-block rounded-sm bg-cine-red/15 px-3 py-1 text-xs font-bold tracking-[0.2em] text-cine-red"
            >
              FUNCIÓN EXCLUSIVA
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-6xl font-extrabold leading-[0.95] tracking-tight text-cine-text sm:text-7xl"
            >
              <Image
                src="/img/LogoCaptura.png"
                alt={titulo}
                width={475}
                height={100}
                priority
                className="h-16 w-auto object-contain sm:h-20"
              />
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-sm font-semibold uppercase tracking-[0.25em] text-cine-muted"
            >
              {EVENT_SUBTITLE}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-base leading-relaxed text-cine-muted"
            >
              {EVENT_TAGLINE}
            </motion.p>

            {proximaFuncionISO && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="pt-1"
              >
                <Countdown targetISO={proximaFuncionISO} />
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap gap-x-8 gap-y-3 pt-1"
            >
              {metaItems.map(({ icon: Icon, label, href }) =>
                href ? (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-cine-text underline-offset-4 transition hover:text-cine-red hover:underline"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-cine-red" />
                    <span>{label}</span>
                  </a>
                ) : (
                  <div key={label} className="flex items-center gap-2 text-sm text-cine-text">
                    <Icon className="h-4 w-4 shrink-0 text-cine-red" />
                    <span>{label}</span>
                  </div>
                )
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="space-y-3 pt-2"
            >
              <Link
                href="/funciones"
                className="inline-block rounded-md bg-cine-red px-10 py-4 text-sm font-bold tracking-wider text-cine-text transition hover:scale-[1.02] hover:shadow-[0_0_45px_-8px_rgba(229,9,20,0.85)]"
              >
                CONFIRMAR INVITACIÓN
              </Link>
              <p className="flex items-center gap-2 text-xs text-cine-muted">
                <IconLock className="h-3.5 w-3.5 text-cine-muted" />
                Acceso únicamente mediante serial de invitación.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ opacity: { duration: 0.6, delay: 0.8 }, y: { duration: 1.8, repeat: Infinity, ease: "easeInOut" } }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-cine-muted"
      >
        <IconChevronDown className="h-6 w-6" />
      </motion.div>
    </section>
  );
}
