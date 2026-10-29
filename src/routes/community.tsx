import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/layout/SiteChrome";
import { whatsappUrl } from "@/config/site";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/community")({
  staticData: { sitemap: true },
  head: () => pageHead("/community", "Join the HackX Community on WhatsApp", "Join the HackX WhatsApp community for event updates, team-finding and builder chat."),
  component: CommunityPage,
});

function CommunityPage() {
  return (
    <main>
      <PageHeader eyebrow="Community" title="Join the community" intro="Get event news first, find teammates and talk with other builders in our WhatsApp group." />
      <Section>
        <ul className="mb-8 space-y-2 text-muted-foreground">
          <li>· First to hear about new events</li>
          <li>· Find teammates before the hackathon</li>
          <li>· Ask mentors and organisers questions</li>
        </ul>
        <a href={whatsappUrl("Hi HackX, I'd like to join the community group")} target="_blank" rel="noopener noreferrer" className="btn-silver">
          Join on WhatsApp
        </a>
      </Section>
    </main>
  );
}
