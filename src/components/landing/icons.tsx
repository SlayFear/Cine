interface IconProps {
  className?: string;
}

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconMapPin({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M20 10.5c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10.5" r="2.75" />
    </svg>
  );
}

export function IconCalendar({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </svg>
  );
}

export function IconClock({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function IconHourglass({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M6 3h12M6 21h12" />
      <path d="M7 3c0 4 3.2 5.5 5 7-1.8 1.5-5 3-5 7M17 3c0 4-3.2 5.5-5 7 1.8 1.5 5 3 5 7" />
    </svg>
  );
}

export function IconLock({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function IconChevronDown({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M5 8.5 12 15l7-6.5" />
    </svg>
  );
}

export function IconPlay({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M8 5.5v13l11-6.5-11-6.5Z" />
    </svg>
  );
}

export function IconMenu({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M4 6.5h16M4 12h16M4 17.5h16" />
    </svg>
  );
}

export function IconClose({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M5.5 5.5 18.5 18.5M18.5 5.5 5.5 18.5" />
    </svg>
  );
}

export function IconTicket({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M4 9.5a2 2 0 0 0 0 4V16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2.5a2 2 0 0 1 0-4V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2.5Z" />
      <path d="M14.5 6v11.5" strokeDasharray="2.2 2.2" />
    </svg>
  );
}

export function IconUserCheck({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <circle cx="10" cy="8.5" r="3.5" />
      <path d="M4 20c0-3.6 2.7-6 6-6s6 2.4 6 6" />
      <path d="M16.5 12.5 18 14l3-3" />
    </svg>
  );
}

export function IconSeat({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M6.5 12V6.5a1.5 1.5 0 0 1 1.5-1.5h8a1.5 1.5 0 0 1 1.5 1.5V12" />
      <path d="M5 12h14a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5v-1A1.5 1.5 0 0 1 5 12Z" />
      <path d="M6 16v3.5M18 16v3.5" />
    </svg>
  );
}

export function IconInstagram({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconFilm({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="2.1" />
      <circle cx="12" cy="6.2" r="1" fill="currentColor" stroke="none" />
      <circle cx="17.3" cy="9.6" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.4" cy="15.6" r="1" fill="currentColor" stroke="none" />
      <circle cx="8.6" cy="15.6" r="1" fill="currentColor" stroke="none" />
      <circle cx="6.7" cy="9.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconStar({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M12 3.5l2.47 5.13 5.53.62-4.1 3.87 1.1 5.53L12 15.9l-4.99 2.75 1.1-5.53-4.1-3.87 5.53-.62L12 3.5Z" />
    </svg>
  );
}

export function IconQr({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <rect x="3.5" y="3.5" width="6" height="6" rx="1" />
      <rect x="14.5" y="3.5" width="6" height="6" rx="1" />
      <rect x="3.5" y="14.5" width="6" height="6" rx="1" />
      <path d="M14.5 14.5h2.75M14.5 18.25h2.75M18.75 14.5v2.1M18.75 18.6v1.4" />
    </svg>
  );
}
