import type { HTMLAttributes } from "react";

type SpotlightCardProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "details";
};

// Plain framed card: a quiet border highlight on hover, no pointer tracking.
export function SpotlightCard({ as: Tag = "div", className = "", ...props }: SpotlightCardProps) {
  return <Tag {...props} className={`spotlight-card ${className}`} />;
}
