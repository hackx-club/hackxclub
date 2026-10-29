import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, PageHeader, Section } from "@/components/layout/SiteChrome";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/events/")({
  staticData: { sitemap: true },
  head: () => pageHead("/events", "Events | HackX", "All HackX hackathons, upcoming and past. HackX 1.0 is on 28 December 2026.", { crumb: "Events" }),
  component: EventsPage,
});

function EventsPage() {
  return (
    <main>
      <PageHeader eyebrow="Events" title="All events" intro="Upcoming and past HackX hackathons." />
      <Section title="Upcoming">
        <Link to="/events/hackx-1-0" className="block transition-transform hover:-translate-y-0.5">
          <Card>
            <p className="eyebrow">28 December 2026 · 12 hours</p>
            <h3 className="mt-3 text-2xl font-semibold">HackX 1.0</h3>
            <p className="mt-2 text-muted-foreground">Over ₹20,000 prize pool · Food included · Venue [TO BE ANNOUNCED]</p>
            <p className="mt-4 text-sm underline underline-offset-4">View details →</p>
          </Card>
        </Link>
      </Section>
      <Section title="Past">
        <p className="text-muted-foreground">No past events yet. HackX 1.0 is our first.</p>
      </Section>
    </main>
  );
}
