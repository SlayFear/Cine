import ScrollReveal from "./ScrollReveal";
import { IconQr, IconSeat, IconTicket, IconUserCheck } from "./icons";

const STEPS = [
  {
    icon: IconTicket,
    title: "Valida tu invitación",
    description: "Ingresa tu serial único y verifica tu acceso.",
  },
  {
    icon: IconUserCheck,
    title: "Confirma tu asistencia",
    description: "Confirma que asistirás a la función.",
  },
  {
    icon: IconSeat,
    title: "Elige tu asiento",
    description: "Selecciona el mejor lugar en la sala.",
  },
  {
    icon: IconQr,
    title: "Obtén tu pase QR",
    description: "Recibe tu código QR y disfruta la función.",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative bg-cine-bg px-6 py-28 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="mb-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-cine-text sm:text-4xl">
            ¿CÓMO FUNCIONA?
          </h2>
          <div className="mx-auto mt-4 h-0.5 w-14 bg-cine-red" />
        </ScrollReveal>

        <div className="relative grid grid-cols-1 gap-y-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-6">
          <div className="pointer-events-none absolute top-[38px] right-[12.5%] left-[12.5%] hidden h-px bg-gradient-to-r from-cine-red/40 via-cine-border to-cine-red/40 lg:block" />

          {STEPS.map((step, i) => (
            <ScrollReveal
              key={step.title}
              delay={i * 0.12}
              className="relative flex flex-col items-center text-center"
            >
              <div className="relative z-10 mb-6 flex h-[76px] w-[76px] items-center justify-center rounded-full border border-cine-red/50 bg-cine-bg text-cine-red">
                <step.icon className="h-7 w-7" />
                <span className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-cine-red text-[11px] font-bold text-cine-text">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-cine-text">
                {step.title}
              </h3>
              <p className="mt-2 max-w-[210px] text-sm text-cine-muted">{step.description}</p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
