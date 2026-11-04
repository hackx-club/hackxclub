import { createFileRoute } from "@tanstack/react-router";
import { Card, CtaBanner, PageHeader, Section } from "@/components/layout/SiteChrome";
import { mentors, pillars, team } from "@/content/site-content";
import deekshana from "@/assets/deekshana.jpeg.asset.json";
import rodick from "@/assets/rodick.jpeg.asset.json";
import teamMember from "@/assets/team-member.png.asset.json";

const photos = { deekshana: deekshana.url, rodick: rodick.url, member: teamMember.url } as const;
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
      <Section title="Why HackX exists">
        <div className="max-w-2xl space-y-5 text-lg text-muted-foreground" data-reveal>
          <p>We're students, and we noticed something: everyone tells us to get ready for the future, but almost nothing is built for us to actually start something.</p>
          <p>Startup events are made for adults. Hackathons are made for people who already code. Students with a big idea and nowhere to take it get left out.</p>
          <p>So we stopped waiting for someone else to build it. HackX is a club made by students, for students: a place to meet other builders and founders, and to try your idea in the real world.</p>
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
              {m.photo ? (
                <img src={photos[m.photo]} alt={m.name} loading="lazy" className="aspect-square w-full rounded-lg object-cover" />
              ) : (
                <div className="aspect-square rounded-lg bg-muted" />
              )}
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
