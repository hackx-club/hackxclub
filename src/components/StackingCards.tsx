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
    const cards = slots.map((slot) => slot.querySelector<HTMLElement>(".stack-card"));
    const current = slots.map(() => 0);
    let last = 0;
    const update = (now: number) => {
      frame = 0;
      const dt = last ? Math.min(now - last, 50) : 16;
      last = now;
      const ease = 1 - Math.exp(-dt / 90);
      let moving = false;
      slots.forEach((slot, index) => {
        const next = slots[index + 1];
        const card = cards[index];
        if (!card) return;
        let target = 0;
        if (!motion.matches && next) {
          const top = tops[index] ?? 0;
          const nextTop = tops[index + 1] ?? 0;
          const height = heights[index] ?? 0;
          target = Math.max(
            0,
            Math.min(
              1,
              (top + height - next.getBoundingClientRect().top) /
                Math.max(1, height - (nextTop - top)),
            ),
          );
        }
        const value = motion.matches
          ? target
          : (current[index] ?? 0) + (target - (current[index] ?? 0)) * ease;
        current[index] = Math.abs(target - value) < 0.001 ? target : value;
        if (current[index] !== target) moving = true;
        const c = current[index] ?? 0;
        card.style.setProperty("--stack-scale", String(1 - c * 0.08));
        card.style.setProperty("--stack-brightness", String(1 - c * 0.5));
        card.style.setProperty("--stack-lift", String(c));
      });
      if (moving) frame = requestAnimationFrame(update);
      else last = 0;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      schedule();
    };
    const observer = new ResizeObserver(onResize);
    observer.observe(host);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    motion.addEventListener("change", schedule);
    measure();
    frame = requestAnimationFrame(update);
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
        <div
          key={item.title}
          className="stack-slot"
          style={{ "--stack-index": index } as CSSProperties}
        >
          <SpotlightCard className="stack-card">
            <span className="stack-number">{String(index + 1).padStart(2, "0")}</span>
            <div className="stack-copy">
              <h3 className="stack-title">{item.title}</h3>
              <p className="mt-3 text-muted-foreground">{item.description}</p>
              {item.bio && (
                <details className="mt-4 text-sm text-muted-foreground">
                  <summary className="cursor-pointer">About {item.title}</summary>
                  <p className="mt-3">{item.bio}</p>
                </details>
              )}
            </div>
            {item.photo && (
              <img src={item.photo} alt={item.title} loading="lazy" className="stack-photo" />
            )}
          </SpotlightCard>
        </div>
      ))}
    </div>
  );
}
