import { createFileRoute, Link } from "@tanstack/react-router";
import { Hero } from "@/components/hero/Hero";
import { CtaBanner, SectionHeading, SponsorMarquee } from "@/components/layout/SiteChrome";
import { hackx1, numbers, pillars } from "@/content/site-content";
import { pageHead } from "@/lib/seo";
import { SpotlightCard } from "@/components/SpotlightCard";
import { StackingCards } from "@/components/StackingCards";
import { DecodeText } from "@/components/DecodeText";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () =>
    pageHead(
      "/",
      "HackX | Student & Founder Tech Club in India",
      "HackX is a student and founder tech club in India. We run hackathons and founder meetups. HackX 1.0: 28 Dec 2026, 12 hours.",
    ),
  component: Index,
});

function Index() {
  return (
    <main>
      <Hero />

      <section className="mx-auto max-w-6xl px-6 py-28">
        <SectionHeading eyebrow="Who we are" title="A club for people who would rather build than talk about it.">
          HackX is a student and founder tech club in India. We bring builders into one room and give them a reason to ship.
        </SectionHeading>
        <Link to="/about" className="text-sm font-medium" data-reveal>Read our story <span className="arrow">→</span></Link>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading eyebrow="What we do" title="Three ways we build together." />
        <StackingCards items={pillars.map((p) => ({ title: p.title, description: p.body }))} />
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading eyebrow="HackX in numbers" title="Early days. Big plans." />
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {numbers.map((n) => (
            <div key={n.label} data-reveal>
              <p className="headline-lg" data-count={n.value} data-prefix={n.prefix ?? ""} data-suffix={n.suffix}>
                {n.prefix ?? ""}{n.value.toLocaleString("en-IN")}{n.suffix}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{n.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading eyebrow="Upcoming" title="HackX 1.0" />
        <Link to="/events/hackx-1-0" className="block">
          <SpotlightCard className="card-lift rounded-2xl p-8 md:p-12" data-reveal>
          <div className="grid gap-6 md:grid-cols-5">
            {[["Date", hackx1.date], ["Duration", hackx1.duration], ["Prize pool", hackx1.prize], ["Food", "Included"], ["Venue", hackx1.venue]].map(([k, v]) => (
              <div key={k}><p className="eyebrow">{k}</p><p className="mt-2 text-lg font-semibold">{v}</p></div>
            ))}
          </div>
          <p className="mt-10 text-sm font-medium">See details <span className="arrow">→</span></p>
          </SpotlightCard>
        </Link>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6"><p className="eyebrow mb-6"><DecodeText>Sponsors</DecodeText></p></div>
        <SponsorMarquee />
      </section>

      <CtaBanner title="Build with us on 28 December." body="12 hours, real products, people who care." />
    </main>
  );
}
