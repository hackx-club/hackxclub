import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

// Native scrolling with a scroll progress bar, reveal-on-scroll and count-up. Off when reduced motion is set.
export function Motion() {
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bar = document.getElementById("scroll-progress");
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
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
          (entries) =>
            entries.forEach((en) => {
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
    const prepare = (el: HTMLElement) => {
      if (seen.has(el)) return;
      seen.add(el);
      if (io && el.getBoundingClientRect().top >= window.innerHeight) {
        el.classList.add("reveal-pending");
        io.observe(el);
      } else {
        el.classList.add("is-in");
        if (!reduce && el.dataset["count"]) countUp(el);
      }
    };
    const scan = (root: Element) => {
      if (root instanceof HTMLElement && root.matches("[data-reveal], [data-count]")) prepare(root);
      root.querySelectorAll<HTMLElement>("[data-reveal], [data-count]").forEach(prepare);
    };
    scan(document.body);
    const mo = new MutationObserver((records) => {
      records.forEach((record) =>
        record.addedNodes.forEach((node) => {
          if (node instanceof Element) scan(node);
        }),
      );
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      io?.disconnect();
    };
  }, []);

  return <div id="scroll-progress" className="scroll-progress" aria-hidden />;
}

function countUp(el: HTMLElement) {
  const target = Number(el.dataset["count"]);
  const start = performance.now();
  const fmt = (n: number) =>
    `${el.dataset["prefix"] ?? ""}${Math.round(n).toLocaleString("en-IN")}${el.dataset["suffix"] ?? ""}`;
  const step = (t: number) => {
    const p = Math.min((t - start) / 800, 1);
    el.textContent = fmt(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
