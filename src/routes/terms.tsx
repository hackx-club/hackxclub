import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/layout/SiteChrome";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  staticData: { sitemap: true },
  head: () => pageHead("/terms", "Terms of Use | HackX", "Terms for using hackx.club and joining HackX events.", { crumb: "Terms of Use" }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <main>
      <PageHeader eyebrow="Legal" title="Terms of Use" />
      <Section>
        <p className="max-w-2xl text-muted-foreground">By registering you agree to follow the event code of conduct and organiser instructions. Projects you build remain yours. Event details may change; updates are shared on WhatsApp.</p>
      </Section>
    </main>
  );
}
