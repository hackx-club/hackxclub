import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { whatsappUrl, site } from "@/config/site";
import { SpotlightCard } from "@/components/SpotlightCard";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="HackX home">
      <svg viewBox="0 0 28 26" width="26" height="24" aria-hidden>
        <g stroke="var(--foreground)" strokeWidth="2">
          <line x1="14" y1="15" x2="14" y2="4" />
          <line x1="14" y1="15" x2="4" y2="21" />
          <line x1="14" y1="15" x2="24" y2="21" />
        </g>
        <circle cx="14" cy="4" r="3.3" fill="var(--foreground)" />
        <circle cx="4" cy="21" r="3.3" fill="var(--foreground)" />
        <circle cx="24" cy="21" r="3.3" fill="var(--foreground)" />
        <circle cx="14" cy="15" r="5" fill="var(--logo-blue)" />
      </svg>
      <span className="text-xl font-medium tracking-tight">
        Hack<span className="font-bold" style={{ color: "var(--logo-blue)" }}>X</span>
      </span>
    </Link>
  );
}

const nav = [
  { to: "/events", label: "Events" },
  { to: "/about", label: "About" },
  { to: "/partner", label: "Partner" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />
        <div className="hidden items-center gap-7 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="nav-link text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {n.label}
            </Link>
          ))}
          <Link to="/register" className="btn-silver btn-sm">Register</Link>
        </div>
        <button
          className="text-sm md:hidden"
          aria-expanded={open}
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open && (
        <div className="flex flex-col gap-4 border-t border-border px-6 py-5 md:hidden">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="text-muted-foreground">
              {n.label}
            </Link>
          ))}
          <Link to="/register" onClick={() => setOpen(false)} className="btn-silver btn-sm self-start">Register</Link>
        </div>
      )}
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            A student and founder tech club in India. We run hackathons and founder meetups.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="eyebrow mb-2">Explore</p>
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="text-muted-foreground hover:text-foreground">
              {n.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="eyebrow mb-2">Legal</p>
          <Link to="/register" className="text-muted-foreground hover:text-foreground">Register</Link>
          <Link to="/privacy" className="text-muted-foreground hover:text-foreground">Privacy</Link>
          <Link to="/terms" className="text-muted-foreground hover:text-foreground">Terms</Link>
        </div>
      </div>
      <p className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © 2026 {site.name} · {site.domain}
      </p>
    </footer>
  );
}

export function WhatsAppFab() {
  return (
    <a
      href={whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with HackX on WhatsApp"
      className="fab-whatsapp hidden md:grid"
    >
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden>
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4a.5.5 0 0 0 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.7-1.2 2.2 2.2 0 0 0 .2-1.2c-.1-.2-.3-.2-.5-.3Z" />
      </svg>
    </a>
  );
}

export function PageHeader({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: ReactNode }) {
  return (
    <header className="mx-auto max-w-6xl px-6 pb-12 pt-20 md:pt-28" data-reveal>
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="text-chrome headline-xl mt-4">{title}</h1>
      {intro && <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{intro}</p>}
    </header>
  );
}

export function Section({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      {title && <h2 className="mb-6 text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>}
      {children}
    </section>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return <SpotlightCard className="card-lift rounded-xl p-6" data-reveal>{children}</SpotlightCard>;
}

export function MobileBar() {
  return (
    <div className="mobile-bar md:hidden">
      <Link to="/register" className="btn-silver btn-sm flex-1 justify-center">Register</Link>
      <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="btn-ghost flex-1 justify-center">WhatsApp</a>
    </div>
  );
}

export function SectionHeading({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-10 max-w-3xl" data-reveal>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="headline-lg mt-3">{title}</h2>
      {children && <p className="mt-5 text-lg text-muted-foreground">{children}</p>}
    </div>
  );
}

export function CtaBanner({ title, body }: { title: string; body?: string }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 text-center" data-reveal>
      <h2 className="headline-lg mx-auto max-w-3xl">{title}</h2>
      {body && <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">{body}</p>}
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link to="/register" className="btn-silver">Register for HackX 1.0 <span className="arrow">→</span></Link>
        <Link to="/contact" className="btn-ghost">Contact us</Link>
      </div>
    </section>
  );
}

export function SponsorMarquee() {
  const slots = Array.from({ length: 8 }, (_, i) => i);
  return (
    <div className="marquee" aria-label="Sponsor slots, to be announced">
      <div className="marquee-track">
        {[...slots, ...slots].map((i, k) => (
          <SpotlightCard key={k} className="sponsor-slot" aria-hidden={k >= slots.length}>Sponsor [TBA]</SpotlightCard>
        ))}
      </div>
    </div>
  );
}
