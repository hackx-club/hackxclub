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
  }, [path]);

  // Reveal-on-scroll. Watches the page for newly added elements so pages opened
  // from the menu (rendered after this runs) still appear.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = reduce
      ? null
      : new IntersectionObserver(
          (entries) => entries.forEach((en) => {
            if (!en.isIntersecting) return;
            const el = en.target as HTMLElement;
            el.classList.add("is-in");
            if (el.dataset["count"]) countUp(el);
            io?.unobserve(el);
          }),
          { threshold: 0.1 },
        );
    // Track processed elements in a WeakSet instead of a DOM attribute:
    // a data-seen attribute landing in the DOM before hydration completes
    // triggers a React hydration mismatch warning.
    const seen = new WeakSet<HTMLElement>();
    const scan = () => {
      document.querySelectorAll<HTMLElement>("[data-reveal], [data-count]").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        if (io) io.observe(el);
        else el.classList.add("is-in");
      });
    };
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { mo.disconnect(); io?.disconnect(); };
  }, []);

  // Magnetic buttons: buttons lean gently toward the pointer (mouse only).
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !window.matchMedia("(pointer: fine)").matches) return;
    let active: HTMLElement | null = null;
    const onMove = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>(".btn-silver, .btn-ghost");
      if (active && active !== el) { active.style.transform = ""; active = null; }
      if (!el) return;
      active = el;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.25;
      const y = (e.clientY - r.top - r.height / 2) * 0.35;
      el.style.transform = `translate(${x}px, ${y}px)`;
    };
    const onLeave = () => { if (active) active.style.transform = ""; active = null; };
    addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => { removeEventListener("pointermove", onMove); document.removeEventListener("pointerleave", onLeave); };
  }, []);

  return <div id="scroll-progress" className="scroll-progress" aria-hidden />;
}

function countUp(el: HTMLElement) {
  const target = Number(el.dataset["count"]);
  const start = performance.now();
  const fmt = (n: number) => `${el.dataset["prefix"] ?? ""}${Math.round(n).toLocaleString("en-IN")}${el.dataset["suffix"] ?? ""}`;
  const step = (t: number) => {
    const p = Math.min((t - start) / 800, 1);
    el.textContent = fmt(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
