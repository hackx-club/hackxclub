import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const HeroParticleX = lazy(() => import("./HeroParticleX"));

function StaticX() {
  return (
    <div aria-hidden className="hero-poster">
      <span className="hero-poster-x">X</span>
    </div>
  );
}

export function Hero() {
  const [mode, setMode] = useState<"poster" | "particles">("poster");

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowPower = (navigator.hardwareConcurrency ?? 8) <= 2;
    if (!reduce && !lowPower) setMode("particles");
  }, []);

  return (
    <header className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="absolute inset-0">
        {mode === "poster" && <StaticX />}
        {mode === "particles" && (
          <Suspense fallback={<StaticX />}>
            <HeroParticleX />
          </Suspense>
        )}
      </div>
      <div className="hero-vignette pointer-events-none absolute inset-0" />

      <div className="relative z-10 mt-[30vh] flex flex-col items-center md:mt-[34vh]">
        <p className="eyebrow animate-in fade-in duration-700">Student &amp; founder tech club · India</p>
        <h1 className="headline-xl text-chrome mt-5 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
          Where students build what's next.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground md:text-xl animate-in fade-in duration-700 delay-500 fill-mode-both">
          HackX brings student builders and founders together to ship real things.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3 animate-in fade-in duration-700 delay-700 fill-mode-both">
          <Link to="/register" className="btn-silver">Register for HackX 1.0 <span className="arrow">→</span></Link>
          <Link to="/contact" className="btn-ghost">Contact us</Link>
        </div>
      </div>
    </header>
  );
}
