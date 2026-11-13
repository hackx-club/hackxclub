import React, { useEffect, useRef } from "react";
import { trackList } from "@/content/site-content";

const icons: Record<string, React.ReactNode> = {
  ai: <><rect x="6" y="6" width="12" height="12" rx="2" /><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" /><circle cx="12" cy="12" r="2" /></>,
  industry: <><path d="M3 21V10l5 3V10l5 3V6h4l1 15z" /><path d="M3 21h18" /></>,
  climate: <><path d="M5 19c0-8 6-14 15-14 0 9-6 15-14 15" /><path d="M5 19 13 11" /></>,
  open: <><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></>,
};

const TITLE = "Choose your track";

// Tracks for HackX 1.0. One IntersectionObserver reveals heading words and cards;
// hover tilt/light only on fine pointers, written via rAF to CSS variables.
export function TracksSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { root.classList.add("tracks-in"); return; }
    const io = new IntersectionObserver(([en]) => {
      if (en?.isIntersecting) { root.classList.add("tracks-in"); io.disconnect(); }
    }, { threshold: 0.15 });
    io.observe(root);
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return () => io.disconnect();
    const cards = Array.from(root.querySelectorAll<HTMLElement>(".track-card"));
    const offs = cards.map((c) => {
      let raf = 0;
      const move = (ev: PointerEvent) => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const r = c.getBoundingClientRect();
          const x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
          c.style.setProperty("--mx", `${x * 100}%`);
          c.style.setProperty("--my", `${y * 100}%`);
          c.style.setProperty("--rx", `${(0.5 - y) * 6}deg`);
          c.style.setProperty("--ry", `${(x - 0.5) * 6}deg`);
        });
      };
      const leave = () => { cancelAnimationFrame(raf); ["--rx", "--ry"].forEach((k) => c.style.setProperty(k, "0deg")); };
      c.addEventListener("pointermove", move);
      c.addEventListener("pointerleave", leave);
      return () => { c.removeEventListener("pointermove", move); c.removeEventListener("pointerleave", leave); };
    });
    return () => { io.disconnect(); offs.forEach((f) => f()); };
  }, []);

  return (
    <section ref={ref} className="tracks mx-auto max-w-6xl px-6 py-16" aria-labelledby="tracks-title">
      <h2 id="tracks-title" className="headline-lg" aria-label={TITLE}>
        {TITLE.split(" ").map((w, i) => (
          <span key={i} aria-hidden className="tracks-word" style={{ ["--i" as string]: i }}>{w}&nbsp;</span>
        ))}
      </h2>
      <p className="tracks-sub mt-4 text-lg text-muted-foreground">Pick the problem you want to spend 12 hours on.</p>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {trackList.map((t, i) => (
          <article key={t.title} className="track-card" style={{ ["--i" as string]: i }}>
            <span className="track-num" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
            <svg className="track-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{icons[t.icon]}</svg>
            <h3 className="mt-6 text-xl font-semibold tracking-tight">{t.title}</h3>
            <p className="mt-2 text-muted-foreground">{t.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
