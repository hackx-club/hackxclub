import { useState, useEffect } from "react";

interface CountdownProps {
  targetDate: string; // ISO date string e.g. "2026-12-28"
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function calculateTimeLeft(target: string): TimeLeft {
  // Assume 09:00 AM local time if only YYYY-MM-DD is passed
  const targetTime = target.includes("T")
    ? new Date(target).getTime()
    : new Date(`${target}T09:00:00`).getTime();
  const now = new Date().getTime();
  const diff = targetTime - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, isPast: false };
}

export function CountdownTimer({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(targetDate));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  // SSR fallback placeholder to ensure zero hydration mismatch
  if (!mounted) {
    return (
      <div className="rounded-xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between pb-3">
          <span className="eyebrow flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            Live Countdown to Kickoff
          </span>
          <span className="text-xs text-muted-foreground">HackX 1.0</span>
        </div>
        <div className="grid grid-cols-4 gap-3 text-center">
          {["Days", "Hours", "Minutes", "Seconds"].map((label) => (
            <div key={label} className="rounded-lg border border-border bg-background/80 p-3">
              <span className="font-mono text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                --
              </span>
              <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (timeLeft.isPast) {
    return (
      <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-6 text-center">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping mr-2" />
        <span className="font-semibold text-foreground">HackX 1.0 is currently live!</span>
      </div>
    );
  }

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <div
      className="rounded-xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm transition-all"
      aria-label="Event Countdown"
    >
      <div className="flex items-center justify-between pb-3">
        <span className="eyebrow flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          Countdown to Kickoff
        </span>
        <span className="text-xs font-medium text-muted-foreground">December 28, 2026</span>
      </div>
      <div className="grid grid-cols-4 gap-2.5 sm:gap-4 text-center">
        {units.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-lg border border-border/70 bg-background/80 px-2 py-3 sm:p-4 shadow-inner"
          >
            <span className="font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              {String(value).padStart(2, "0")}
            </span>
            <p className="mt-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wider sm:text-xs">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
