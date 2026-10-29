import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, Section } from "@/components/layout/SiteChrome";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  staticData: { sitemap: true },
  head: () => pageHead("/about", "About HackX | Our Mission & Team", "What HackX is, why we run student hackathons, and the team behind HackX 1.0."),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main>
      <PageHeader eyebrow="About" title="What is HackX" intro="HackX is a student-run hackathon where builders spend 12 hours turning ideas into working products." />
      <Section title="Our mission">
        <p className="max-w-2xl text-muted-foreground">Give every student a place to build, ship and learn alongside people who care about making real things.</p>
      </Section>
      <Section title="Team">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <div className="aspect-square rounded-lg bg-muted" />
              <p className="mt-4 font-medium">Team member {i}</p>
              <p className="text-sm text-muted-foreground">Role to be added</p>
            </Card>
          ))}
        </div>
      </Section>
    </main>
  );
}
