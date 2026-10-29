import { createFileRoute, Link } from "@tanstack/react-router";
import { Hero } from "@/components/hero/Hero";
import { Card, Section } from "@/components/layout/SiteChrome";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () =>
    pageHead(
      "/",
      "HackX 1.0 | 12-Hour Hackathon on 28 December 2026 | hackx.club",
      "HackX 1.0 is a 12-hour college hackathon on 28 December 2026. ₹20,000+ prize pool, food included. Register on WhatsApp.",
    ),
  component: Index,
});

function Index() {
  return (
    <main>
      <Hero />
      <Section>
        <div className="grid gap-4 md:grid-cols-3">
          <Card><p className="text-3xl font-bold">12 hrs</p><p className="mt-1 text-muted-foreground">Non-stop building</p></Card>
          <Card><p className="text-3xl font-bold">₹20,000+</p><p className="mt-1 text-muted-foreground">Prize pool</p></Card>
          <Card><p className="text-3xl font-bold">Free food</p><p className="mt-1 text-muted-foreground">All day, on us</p></Card>
        </div>
        <Link to="/events/hackx-1-0" className="mt-8 inline-block text-sm underline underline-offset-4">
          See full HackX 1.0 details →
        </Link>
      </Section>
    </main>
  );
}
