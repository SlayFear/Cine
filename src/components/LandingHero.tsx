import Navbar from "./landing/Navbar";
import Hero from "./landing/Hero";
import InfoSection from "./landing/InfoSection";
import TrailerSection from "./landing/TrailerSection";
import HowItWorks from "./landing/HowItWorks";
import Footer from "./landing/Footer";

interface LandingHeroProps {
  titulo: string;
  sinopsis: string;
  posterUrl: string;
  trailerYoutubeId: string;
  proximaFuncionISO: string | null;
}

export default function LandingHero({
  titulo,
  sinopsis,
  posterUrl,
  trailerYoutubeId,
  proximaFuncionISO,
}: LandingHeroProps) {
  return (
    <main className="relative bg-cine-bg text-cine-text">
      <Navbar />
      <Hero titulo={titulo} posterUrl={posterUrl} proximaFuncionISO={proximaFuncionISO} />
      <InfoSection proximaFuncionISO={proximaFuncionISO} />
      <TrailerSection
        titulo={titulo}
        sinopsis={sinopsis}
        posterUrl={posterUrl}
        trailerYoutubeId={trailerYoutubeId}
      />
      <HowItWorks />
      <Footer />
    </main>
  );
}
