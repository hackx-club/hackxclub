import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/layout/SiteChrome";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  staticData: { sitemap: true },
  head: () =>
    pageHead(
      "/privacy",
      "Privacy Policy | HackX",
      "How HackX collects and uses your information.",
      { crumb: "Privacy Policy" },
    ),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main>
      <PageHeader eyebrow="Legal" title="Privacy Policy" />
      <Section>
        <p className="max-w-2xl text-muted-foreground">
          We only collect what you share with us on WhatsApp or through our contact form (name,
          email, message) and use it to run HackX events. We don't sell your data.
        </p>
      </Section>
    </main>
  );
}
