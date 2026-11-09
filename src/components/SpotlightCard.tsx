import { useEffect, useRef, type HTMLAttributes, type MouseEvent } from "react";

type SpotlightCardProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "details";
};

export function SpotlightCard({ as: Tag = "div", className = "", onMouseMove, onMouseLeave, ...props }: SpotlightCardProps) {
  const frame = useRef(0);
  const position = useRef<{ x: number; y: number; targetX: number; targetY: number; time: number } | null>(null);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
    if (window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) {
      const card = event.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) * card.offsetWidth / rect.width;
      const y = (event.clientY - rect.top) * card.offsetHeight / rect.height;
      if (!position.current) position.current = { x: card.offsetWidth / 2, y: card.offsetHeight / 2, targetX: x, targetY: y, time: performance.now() };
      position.current.targetX = x;
      position.current.targetY = y;
      const tick = (time: number) => {
        frame.current = 0;
        const point = position.current;
        if (!point || !card.isConnected || !window.matchMedia("(prefers-reduced-motion: no-preference)").matches) return;
        const ease = 1 - Math.exp(-(time - point.time) / 150);
        point.time = time;
        point.x += (point.targetX - point.x) * ease;
        point.y += (point.targetY - point.y) * ease;
        card.style.setProperty("--mx", `${point.x}px`);
        card.style.setProperty("--my", `${point.y}px`);
        if (Math.abs(point.targetX - point.x) + Math.abs(point.targetY - point.y) > 0.1) frame.current = requestAnimationFrame(tick);
      };
      if (!frame.current) {
        position.current.time = performance.now();
        frame.current = requestAnimationFrame(tick);
      }
    }
    onMouseMove?.(event);
  };
  const handleMouseLeave = (event: MouseEvent<HTMLElement>) => {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    position.current = null;
    onMouseLeave?.(event);
  };
  return <Tag {...props} className={`spotlight-card ${className}`} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />;
}