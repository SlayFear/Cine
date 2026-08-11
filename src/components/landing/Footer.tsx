import Image from "next/image";
import packageJson from "../../../package.json";

export default function Footer() {
  return (
    <footer id="contacto" className="relative scroll-mt-24 border-t border-cine-border bg-cine-bg px-6 py-16 lg:px-10">
      <div className="mx-auto grid max-w-5xl gap-12 text-center sm:grid-cols-3">
        <div className="flex flex-col items-center space-y-3">
          <Image
            src="/img/LogoCaptura.png"
            alt="La Captura"
            width={190}
            height={40}
            className="h-8 w-auto object-contain"
          />
          <p className="text-sm text-cine-muted">
            Una experiencia cinematográfica exclusiva, por invitación.
          </p>
        </div>

        <div className="flex flex-col items-center space-y-3 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cine-muted">
            Disponible en
          </p>
          <a href="https://www.netflix.com/mx/" target="_blank" rel="noreferrer">
            <Image
              src="/img/Logonetflix.png"
              alt="Netflix"
              width={220}
              height={67}
              className="h-8 w-auto"
            />
          </a>
        </div>

        <div className="flex flex-col items-center justify-center space-y-3 text-center">
          <a href="https://dracofilms.com/" target="_blank" rel="noreferrer">
            <Image
              src="/img/DracoFilmsN.png"
              alt="Draco Films"
              width={1280}
              height={393}
              className="h-12 w-auto"
            />
          </a>
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-7xl flex-col items-center gap-4 border-t border-cine-border pt-8 text-xs text-cine-muted">
        <a
          href="https://notcore.com.mx/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 transition-colors hover:text-cine-text"
        >
          Desarrollado por
          <Image
            src="/img/NCWhiteL.png"
            alt="NotCore"
            width={200}
            height={144}
            className="h-7 w-auto"
          />
        </a>
        <p className="text-[10px] tracking-[0.2em] text-cine-muted/70">v{packageJson.version}</p>
      </div>
    </footer>
  );
}
