import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Card,
  CtaBanner,
  PageHeader,
  Section,
  SponsorMarquee,
} from "@/components/layout/SiteChrome";
import { hackx1 as e } from "@/content/site-content";
import { TracksSection } from "@/components/TracksSection";
import { site } from "@/config/site";
import { pageHead } from "@/lib/seo";
import { SpotlightCard } from "@/components/SpotlightCard";

export const Route = createFileRoute("/events/hackx-1-0")({
  staticData: { sitemap: true },
  head: () =>
    pageHead(
      "/events/hackx-1-0",
      "HackX 1.0 – 28 Dec 2026 | 12-Hour Hackathon | HackX",
      "HackX 1.0: a 12-hour hackathon on 28 December 2026. Prize pool over ₹20,000, food included. Schedule, tracks, rules and FAQ.",
      {
        type: "article",
        crumb: "HackX 1.0",
        jsonLd: [
          {
            "@context": "https://schema.org",
            "@type": "Event",
            name: e.name,
            startDate: e.isoDate,
            eventStatus: "https://schema.org/EventScheduled",
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
            description: "A 12-hour hackathon with a prize pool over ₹20,000. Food included.",
            organizer: { "@type": "Organization", name: site.name, url: site.url },
            url: `${site.url}/events/hackx-1-0`,
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: e.faq.map(([q, a]) => ({
              "@type": "Question",
              name: q,
              acceptedAnswer: { "@type": "Answer", text: a },
            })),
          },
        ],
      },
    ),
  component: EventPage,
});

function EventPage() {
  return (
    <main>
      <PageHeader eyebrow={e.date} title={e.name} intro="12 hours to build something real." />
      <Section>
        <div className="grid gap-4 md:grid-cols-5">
          {[
            ["Date", e.date],
            ["Duration", e.duration],
            ["Prize pool", e.prize],
            ["Food", "Included"],
            ["Venue", e.venue],
          ].map(([k, v]) => (
            <Card key={k}>
              <p className="eyebrow">{k}</p>
              <p className="mt-2 text-lg font-semibold">{v}</p>
            </Card>
          ))}
        </div>
        <Link to="/register" className="btn-silver mt-10">
          Register <span className="arrow">→</span>
        </Link>
      </Section>
      <Section title="Schedule">
        <ol className="divide-y divide-border rounded-xl border border-border" data-reveal>
          {e.schedule.map(([t, x]) => (
            <li key={t} className="flex gap-6 px-6 py-4">
              <span className="w-20 text-muted-foreground">{t}</span>
              <span>{x}</span>
            </li>
          ))}
        </ol>
      </Section>
      <TracksSection />
      <Section title="Prizes & food">
        <div className="grid gap-4 md:grid-cols-3">
          {e.prizes.map((p) => (
            <Card key={p}>
              <p className="font-medium">{p}</p>
            </Card>
          ))}
          <Card>
            <p className="font-medium">Food included for all participants</p>
          </Card>
        </div>
      </Section>
      <Section title="Rules">
        <ul className="space-y-2 text-muted-foreground" data-reveal>
          {e.rules.map((r) => (
            <li key={r}>· {r}</li>
          ))}
        </ul>
      </Section>
      <Section title="FAQ">
        <div className="space-y-3">
          {e.faq.map(([q, a]) => (
            <SpotlightCard as="details" key={q} className="rounded-xl px-6 py-4" data-reveal>
              <summary className="cursor-pointer font-medium">{q}</summary>
              <p className="mt-3 text-muted-foreground">{a}</p>
            </SpotlightCard>
          ))}
        </div>
      </Section>
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight md:text-3xl">Sponsors</h2>
        </div>
        <SponsorMarquee />
      </section>
      <CtaBanner title="Save your spot." />
    </main>
  );
}
