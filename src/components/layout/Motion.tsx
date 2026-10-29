import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

// Smooth scroll, scroll progress bar, reveal-on-scroll and count-up. Off when reduced motion is set.
export function Motion() {
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let lenis: { raf: (t: number) => void; destroy: () => void } | undefined;
    let id = 0;
    import("lenis").then(({ default: Lenis }) => {
      lenis = new Lenis({ duration: 1.1 });
      const loop = (t: number) => { lenis!.raf(t); id = requestAnimationFrame(loop); };
      id = requestAnimationFrame(loop);
    });
    const bar = document.getElementById("scroll-progress");
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => { cancelAnimationFrame(id); lenis?.destroy(); removeEventListener("scroll", onScroll); };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const counters = document.querySelectorAll<HTMLElement>("[data-count]");
    if (reduce) {
      els.forEach((e) => e.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target as HTMLElement;
        el.classList.add("is-in");
        if (el.dataset.count) countUp(el);
        io.unobserve(el);
      }),
      { threshold: 0.15 },
    );
    els.forEach((e) => io.observe(e));
    counters.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [path]);

  return <div id="scroll-progress" className="scroll-progress" aria-hidden />;
}

function countUp(el: HTMLElement) {
  const target = Number(el.dataset.count);
  const start = performance.now();
  const fmt = (n: number) => `${el.dataset.prefix ?? ""}${Math.round(n).toLocaleString("en-IN")}${el.dataset.suffix ?? ""}`;
  const step = (t: number) => {
    const p = Math.min((t - start) / 800, 1);
    el.textContent = fmt(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
