import { useEffect, useRef, type CSSProperties } from "react";
import { SpotlightCard } from "@/components/SpotlightCard";

type StackItem = {
  title: string;
  description: string;
  photo?: string | undefined;
  bio?: string;
};

export function StackingCards({ items }: { items: readonly StackItem[] }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const slots = Array.from(host.querySelectorAll<HTMLElement>(".stack-slot"));
    let frame = 0;
    let tops: number[] = [];
    let heights: number[] = [];
    const measure = () => {
      tops = slots.map((slot) => parseFloat(getComputedStyle(slot).top) || 0);
      heights = slots.map((slot) => slot.offsetHeight);
    };
    const update = () => {
      frame = 0;
      slots.forEach((slot, index) => {
        const next = slots[index + 1];
        const card = slot.querySelector<HTMLElement>(".stack-card");
        if (!card) return;
        let covered = 0;
        if (!motion.matches && next) {
          const top = tops[index] ?? 0;
          const nextTop = tops[index + 1] ?? 0;
          const height = heights[index] ?? 0;
          covered = Math.max(0, Math.min(1, (top + height - next.getBoundingClientRect().top) / Math.max(1, height - (nextTop - top))));
        }
        card.style.setProperty("--stack-scale", String(1 - covered * 0.06));
        card.style.setProperty("--stack-brightness", String(1 - covered * 0.3));
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const onResize = () => { measure(); schedule(); };
    const observer = new ResizeObserver(onResize);
    observer.observe(host);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    motion.addEventListener("change", schedule);
    measure();
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      motion.removeEventListener("change", schedule);
    };
  }, [items]);

  return (
    <div ref={hostRef} className="stacking-cards">
      {items.map((item, index) => (
        <div key={item.title} className="stack-slot" style={{ "--stack-index": index } as CSSProperties}>
          <SpotlightCard className="stack-card">
            <span className="stack-number">{String(index + 1).padStart(2, "0")}</span>
            <div className="stack-copy">
              <h3 className="stack-title">{item.title}</h3>
              <p className="mt-3 text-muted-foreground">{item.description}</p>
              {item.bio && <details className="mt-4 text-sm text-muted-foreground"><summary className="cursor-pointer">About {item.title}</summary><p className="mt-3">{item.bio}</p></details>}
            </div>
            {item.photo && <img src={item.photo} alt={item.title} loading="lazy" className="stack-photo" />}
          </SpotlightCard>
        </div>
      ))}
    </div>
  );
}