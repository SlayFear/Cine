import Image from "next/image";
import { EVENT_DEFAULT_SINOPSIS, EVENT_FALLBACK_POSTER } from "@/lib/eventConfig";
import { youtubeEmbedUrl } from "@/lib/youtube";
import ScrollReveal from "./ScrollReveal";
import { IconPlay } from "./icons";

interface TrailerSectionProps {
  titulo: string;
  sinopsis: string;
  posterUrl: string;
  trailerYoutubeId: string;
}

export default function TrailerSection({
  titulo,
  sinopsis,
  posterUrl,
  trailerYoutubeId,
}: TrailerSectionProps) {
  const poster = posterUrl || EVENT_FALLBACK_POSTER;
  const sinopsisText = sinopsis || EVENT_DEFAULT_SINOPSIS;

  return (
    <section id="trailer" className="relative scroll-mt-24 bg-cine-bg px-6 py-28 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.3fr_1fr] lg:items-center">
        <ScrollReveal>
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-cine-border shadow-[0_0_60px_-15px_rgba(229,9,20,0.35)]">
            {trailerYoutubeId ? (
              <iframe
                className="h-full w-full"
                src={youtubeEmbedUrl(trailerYoutubeId, { autoplay: true, mute: true })}
                title={`Tráiler de ${titulo}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <>
                <Image
                  src={poster}
                  alt={titulo}
                  fill
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-cine-bg/55" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-cine-red/60 bg-cine-bg/70 text-cine-red">
                    <IconPlay className="ml-0.5 h-6 w-6" />
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollReveal>

        <div id="sinopsis" className="scroll-mt-24">
          <ScrollReveal delay={0.15}>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="flex-1 space-y-5">
                <span className="inline-block text-xs font-bold tracking-[0.25em] text-cine-red">
                  SINOPSIS
                </span>
                <p className="leading-relaxed text-cine-muted">{sinopsisText}</p>

                {trailerYoutubeId && (
                  <a
                    href={`https://www.youtube.com/watch?v=${trailerYoutubeId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block rounded-md border border-cine-red px-7 py-3 text-xs font-bold tracking-wider text-cine-red transition hover:bg-cine-red hover:text-cine-text"
                  >
                    VER TRÁILER
                  </a>
                )}
              </div>

              <div className="relative h-56 w-40 shrink-0 overflow-hidden rounded-lg border border-cine-border shadow-2xl shadow-black/60 sm:h-64 sm:w-44">
                <Image src={poster} alt={titulo} fill sizes="176px" className="object-cover" />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
