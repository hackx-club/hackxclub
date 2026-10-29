import { lazy, Suspense, useEffect, useState } from "react";
import { whatsappUrl } from "@/config/site";

const HeroScene = lazy(() => import("./HeroScene"));

function StaticX() {
  return (
    <div aria-hidden className="hero-poster">
      <span className="hero-poster-x">X</span>
    </div>
  );
}

export function Hero() {
  const [mode, setMode] = useState<"poster" | "3d">("poster");
  const [small, setSmall] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowPower = (navigator.hardwareConcurrency ?? 8) <= 2;
    setSmall(window.innerWidth < 768);
    if (!reduce && !lowPower) setMode("3d");
  }, []);

  return (
    <header className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="absolute inset-0">
        {mode === "poster" && <StaticX />}
        {mode === "3d" && (
          <div className="absolute inset-0 animate-in fade-in duration-1000">
            <Suspense fallback={null}>
              <HeroScene small={small} />
            </Suspense>
          </div>
        )}
      </div>
      <div className="hero-vignette pointer-events-none absolute inset-0" />

      <div className="relative z-10 mt-[38vh] flex flex-col items-center md:mt-[42vh]">
        <p className="eyebrow animate-in fade-in slide-in-from-bottom-2 duration-700">
          28 December 2026 · 12-hour hackathon
        </p>
        <h1 className="display-xl text-chrome mt-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          HackX 1.0
        </h1>
        <p className="mt-5 text-lg text-muted-foreground md:text-2xl animate-in fade-in duration-1000 delay-300 fill-mode-both">
          12 hours. Build something real.
        </p>
        <a
          href={whatsappUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-silver mt-10 animate-in fade-in duration-1000 delay-500 fill-mode-both"
        >
          Register on WhatsApp
        </a>
      </div>
    </header>
  );
}
