import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, Section } from "@/components/layout/SiteChrome";
import { whatsappUrl } from "@/config/site";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/partner")({
  staticData: { sitemap: true },
  head: () => pageHead("/partner", "Partner with HackX | Sponsors & Mentors", "Sponsor or mentor at HackX 1.0 and meet motivated student builders.", { crumb: "Partner" }),
  component: PartnerPage,
});

function PartnerPage() {
  return (
    <main>
      <PageHeader eyebrow="Partner" title="Sponsors & mentors" intro="Support the next wave of builders and get your brand in front of them." />
      <Section>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <h3 className="text-xl font-semibold">Sponsors</h3>
            <p className="mt-2 text-muted-foreground">Fund prizes, food or swag. Sponsor slots open now.</p>
            <a href={whatsappUrl("Hi HackX, I'd like to sponsor HackX 1.0")} target="_blank" rel="noopener noreferrer" className="btn-silver btn-sm mt-6">Become a sponsor</a>
          </Card>
          <Card>
            <h3 className="text-xl font-semibold">Mentors</h3>
            <p className="mt-2 text-muted-foreground">Guide teams for a few hours and help them ship.</p>
            <a href={whatsappUrl("Hi HackX, I'd like to mentor at HackX 1.0")} target="_blank" rel="noopener noreferrer" className="btn-silver btn-sm mt-6">Become a mentor</a>
          </Card>
        </div>
      </Section>
    </main>
  );
}
