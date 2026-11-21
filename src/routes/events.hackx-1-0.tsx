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
import { CountdownTimer } from "@/components/CountdownTimer";
import { AddToCalendarButton } from "@/components/AddToCalendarButton";

export const Route = createFileRoute("/events/hackx-1-0")({
  staticData: { sitemap: true },
  head: () =>
    pageHead(
      "/events/hackx-1-0",
      "HackX 1.0 – 12-Hour Student Hackathon in Coimbatore | ₹20K+ Prizes",
      "Join HackX 1.0 on 28 Dec 2026 in Coimbatore, Tamil Nadu. A premier 12-hour student hackathon with ₹20,000+ prize pool, mentor rounds, free food, and 4 innovation tracks.",
      {
        type: "article",
        crumb: "HackX 1.0",
        keywords:
          "HackX 1.0, Hackathon Coimbatore, Student Hackathon Tamil Nadu, 12 Hour Hackathon, College Hackathons 2026, AI Hackathon India, Tamil Nadu Developer Events, Hackathon Registration, HackX",
        jsonLd: [
          {
            "@context": "https://schema.org",
            "@type": "Event",
            name: `${e.name} – 12-Hour Student Hackathon in Coimbatore`,
            startDate: `${e.isoDate}T09:00:00+05:30`,
            endDate: `${e.isoDate}T21:00:00+05:30`,
            eventStatus: "https://schema.org/EventScheduled",
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
            description:
              "HackX 1.0 is a 12-hour student hackathon in Coimbatore with a prize pool over ₹20,000, free food, mentor guidance, and 4 innovation tracks: AI & Automation, Industry 5.0, Climate & Agritech, and Open Track.",
            location: {
              "@type": "Place",
              name: e.venue || "Coimbatore, Tamil Nadu",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Coimbatore",
                addressRegion: "Tamil Nadu",
                addressCountry: "IN",
              },
            },
            offers: {
              "@type": "Offer",
              url: `${site.url}/register`,
              price: "0",
              priceCurrency: "INR",
              availability: "https://schema.org/InStock",
              validFrom: "2026-01-01T00:00:00+05:30",
            },
            organizer: {
              "@type": "Organization",
              name: site.name,
              url: site.url,
            },
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
      <PageHeader
        eyebrow={e.date}
        title={e.name}
        intro="12 hours to turn an idea into something real. Join student builders across Tamil Nadu for a high-intensity product sprint."
      />
      <Section>
        {/* Live Countdown Timer */}
        <div className="mb-8">
          <CountdownTimer targetDate={e.isoDate} />
        </div>

        {/* Quick Facts Grid */}
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

        {/* Call to Actions: Register + Add to Calendar */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link to="/register" className="btn-silver">
            Register Now <span className="arrow">→</span>
          </Link>
          <AddToCalendarButton
            title="HackX 1.0 — 12-Hour Student Hackathon"
            description="HackX 1.0: 12-hour offline student hackathon with ₹20,000+ prize pool, free food, and mentor rounds. Register at https://hackx.club/register"
            startDate={e.isoDate}
            location="Coimbatore, Tamil Nadu, India"
          />
        </div>
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
