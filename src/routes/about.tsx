import { createFileRoute } from "@tanstack/react-router";
import { Card, CtaBanner, PageHeader, Section } from "@/components/layout/SiteChrome";
import { mentors, pillars, team } from "@/content/site-content";
import deekshana from "@/assets/deekshana.jpeg.asset.json";
import rodick from "@/assets/rodick.jpeg.asset.json";

const photos = { deekshana: deekshana.url, rodick: rodick.url } as const;
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  staticData: { sitemap: true },
  head: () => pageHead("/about", "About HackX | Who We Are", "The story behind HackX, a student and founder tech club in India: our mission, values and team.", { crumb: "About" }),
  component: AboutPage,
});

const values = [
  ["Ship over polish", "A working thing beats a perfect slide."],
  ["Build in the open", "Share what you made, and what broke."],
  ["Show up for each other", "The best teams start as strangers in the same room."],
];

function AboutPage() {
  return (
    <main>
      <PageHeader eyebrow="About" title="We started HackX because we wanted a room full of builders." />
      <Section title="Our story">
        <div className="max-w-2xl space-y-5 text-lg text-muted-foreground" data-reveal>
          <p>Most of us learned to build alone, late at night, with nobody to show the result to. We kept meeting people doing the same thing and thought: what if we put them all in one place?</p>
          <p>That's HackX. A club for students and founders in India who want to make real things, together. HackX 1.0 is our first big step. [Founder story details TO BE ANNOUNCED]</p>
        </div>
      </Section>
      <Section title="Mission">
        <p className="headline-lg max-w-4xl" data-reveal>Give every student builder a place to ship, and people to ship with.</p>
      </Section>
      <Section title="Values">
        <div className="grid gap-4 md:grid-cols-3">
          {values.map(([t, b]) => <Card key={t}><h3 className="text-xl font-semibold">{t}</h3><p className="mt-2 text-muted-foreground">{b}</p></Card>)}
        </div>
      </Section>
      <Section title="What we do">
        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map((p) => <Card key={p.title}><h3 className="text-xl font-semibold">{p.title}</h3><p className="mt-2 text-muted-foreground">{p.body}</p></Card>)}
        </div>
      </Section>
      <Section title="Mentors">
        <div className="grid gap-4 md:grid-cols-2">
          {mentors.map((m) => (
            <Card key={m.name}>
              <img src={photos[m.photo]} alt={m.name} loading="lazy" className="aspect-square w-full max-w-[220px] rounded-lg object-cover" />
              <p className="mt-4 text-xl font-semibold">{m.name}</p>
              <p className="text-sm text-muted-foreground">{m.role}</p>
              <p className="mt-3 text-muted-foreground">{m.bio}</p>
            </Card>
          ))}
        </div>
      </Section>
      <Section title="Team">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {team.map((m) => (
            <Card key={m.key}>
              <div className="aspect-square rounded-lg bg-muted" />
              <p className="mt-4 font-medium">{m.name}</p>
              <p className="text-sm text-muted-foreground">{m.role}</p>
            </Card>
          ))}
        </div>
      </Section>
      <CtaBanner title="Come build with us." />
    </main>
  );
}
