import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { DecodeText } from "@/components/DecodeText";
import { homeStory } from "@/content/site-content";

// Start downloading the 3D X as soon as this module loads in the browser, not after hydration.
const loadScene = () => import("./HeroScene");
if (typeof window !== "undefined") void loadScene();
const HeroScene = lazy(loadScene);

function StaticX() {
  return (
    <div aria-hidden className="hero-poster">
      <span className="hero-poster-x">X</span>
    </div>
  );
}

export function Hero() {
  const [mode, setMode] = useState<"poster" | "3d">("poster");

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowPower = (navigator.hardwareConcurrency ?? 8) <= 2;
    if (!reduce && !lowPower) setMode("3d");
  }, []);

  return (
    <header className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="absolute inset-0">
        {mode === "poster" && <StaticX />}
        {mode === "3d" && (
          <Suspense fallback={<StaticX />}>
            <HeroScene />
          </Suspense>
        )}
      </div>
      <div className="hero-vignette pointer-events-none absolute inset-0" />

      <div className="relative z-10 mt-[30vh] flex flex-col items-center md:mt-[34vh]">
        <p className="eyebrow animate-in fade-in duration-300">Student &amp; founder tech club · India</p>
        <h1 className="headline-xl mt-5 max-w-4xl">
          <DecodeText duration={450}>{homeStory.heroTitle}</DecodeText>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground md:text-xl animate-in fade-in duration-300 delay-100 fill-mode-both">
          {homeStory.heroIntro}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3 animate-in fade-in duration-300 delay-200 fill-mode-both">
          <Link to="/register" className="btn-silver">Register for HackX 1.0 <span className="arrow">→</span></Link>
          <Link to="/contact" className="btn-ghost">Contact us</Link>
        </div>
      </div>
    </header>
  );
}
