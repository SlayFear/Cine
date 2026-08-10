import { formatVenueDate, formatVenueWeekday, formatVenueTime } from "@/lib/timezone";
import {
  EVENT_CAPACITY_NOTE,
  EVENT_DURATION,
  EVENT_MAPS_URL,
  EVENT_PRIVACY_NOTE,
  EVENT_RATING,
  EVENT_VENUE_CITY,
  EVENT_VENUE_NAME,
} from "@/lib/eventConfig";
import ScrollReveal from "./ScrollReveal";
import { IconCalendar, IconClock, IconHourglass, IconLock, IconMapPin } from "./icons";

interface InfoSectionProps {
  proximaFuncionISO: string | null;
}

export default function InfoSection({ proximaFuncionISO }: InfoSectionProps) {
  const cards = [
    {
      icon: IconMapPin,
      title: "Lugar",
      primary: EVENT_VENUE_NAME,
      secondary: EVENT_VENUE_CITY,
      href: EVENT_MAPS_URL,
      linkLabel: "Cómo llegar",
    },
    {
      icon: IconCalendar,
      title: "Fecha",
      primary: proximaFuncionISO ? formatVenueDate(proximaFuncionISO) : "Próximamente",
      secondary: proximaFuncionISO ? formatVenueWeekday(proximaFuncionISO) : "Por confirmar",
    },
    {
      icon: IconClock,
      title: "Hora",
      primary: proximaFuncionISO ? formatVenueTime(proximaFuncionISO) : "Por confirmar",
    },
    {
      icon: IconHourglass,
      title: "Duración",
      primary: EVENT_DURATION,
      secondary: EVENT_RATING,
    },
    {
      icon: IconLock,
      title: "Evento privado",
      primary: EVENT_PRIVACY_NOTE,
      secondary: EVENT_CAPACITY_NOTE,
    },
  ];

  return (
    <section id="informacion" className="relative scroll-mt-24 bg-cine-bg px-6 py-28 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-cine-text sm:text-4xl">
            INFORMACIÓN DEL EVENTO
          </h2>
          <div className="mx-auto mt-4 h-0.5 w-14 bg-cine-red" />
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {cards.map((card, i) => (
            <ScrollReveal key={card.title} delay={i * 0.08}>
              <div className="group h-full rounded-xl border border-cine-border bg-white/[0.02] p-7 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-cine-red/50 hover:bg-white/[0.04] hover:shadow-[0_0_35px_-12px_rgba(229,9,20,0.5)]">
                <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-cine-red/40 text-cine-red transition-colors group-hover:border-cine-red group-hover:bg-cine-red/10">
                  <card.icon className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cine-muted">
                  {card.title}
                </p>
                <p className="mt-3 text-base font-semibold text-cine-text">{card.primary}</p>
                <p className="mt-1 text-sm text-cine-muted">{card.secondary}</p>
                {card.href && (
                  <a
                    href={card.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-xs font-semibold tracking-wide text-cine-red underline-offset-4 hover:underline"
                  >
                    {card.linkLabel} →
                  </a>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
