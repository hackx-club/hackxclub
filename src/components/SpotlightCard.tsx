import type { HTMLAttributes, MouseEvent } from "react";

type SpotlightCardProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "details";
};

export function SpotlightCard({ as: Tag = "div", className = "", onMouseMove, ...props }: SpotlightCardProps) {
  const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
    if (window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) {
      const rect = event.currentTarget.getBoundingClientRect();
      event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
    }
    onMouseMove?.(event);
  };

  return <Tag {...props} className={`spotlight-card ${className}`} onMouseMove={handleMouseMove} />;
}