import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, Section } from "@/components/layout/SiteChrome";
import { whatsappUrl } from "@/config/site";
import { pageHead } from "@/lib/seo";

const tracks = ["Track 1 (TBA)", "Track 2 (TBA)", "Track 3 (TBA)", "Track 4 (TBA)", "Track 5 (TBA)"];
const schedule = [
  ["08:00", "Check-in & breakfast"],
  ["09:00", "Opening ceremony"],
  ["09:30", "Hacking starts"],
  ["13:00", "Lunch"],
  ["17:00", "Snacks & mentor rounds"],
  ["21:30", "Hacking ends"],
  ["21:45", "Demos & judging"],
  ["23:00", "Winners announced"],
];
const faq = [
  ["Who can join?", "Any college student. Teams of up to 4."],
  ["Does it cost anything?", "Registration details are shared on WhatsApp."],
  ["Is food provided?", "Yes, meals and snacks are included."],
  ["Where is it?", "The venue will be announced soon."],
  ["What should I bring?", "A laptop, charger, and your ideas."],
];

export const Route = createFileRoute("/events/hackx-1-0")({
  staticData: { sitemap: true },
  head: () =>
    pageHead(
      "/events/hackx-1-0",
      "HackX 1.0 – 28 Dec 2026 | Tracks, Schedule & FAQ",
      "HackX 1.0: 12-hour hackathon on 28 December 2026. Prize pool over ₹20,000, food included. See tracks, schedule and FAQ.",
      "article",
    ),
  component: EventPage,
});

function EventPage() {
  return (
    <main>
      <PageHeader eyebrow="28 December 2026" title="HackX 1.0" intro="12 hours to build something real." />
      <Section>
        <div className="grid gap-4 md:grid-cols-4">
          {[["Date", "28 Dec 2026"], ["Duration", "12 hours"], ["Prize pool", "₹20,000+"], ["Venue", "To be announced"]].map(([k, v]) => (
            <Card key={k}><p className="eyebrow">{k}</p><p className="mt-2 text-xl font-semibold">{v}</p></Card>
          ))}
        </div>
        <p className="mt-4 text-muted-foreground">Food included for all participants.</p>
        <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="btn-silver mt-8">Register on WhatsApp</a>
      </Section>
      <Section title="Tracks">
        <div className="grid gap-4 md:grid-cols-5">
          {tracks.map((t) => <Card key={t}><p className="font-medium">{t}</p></Card>)}
        </div>
      </Section>
      <Section title="Schedule">
        <ol className="divide-y divide-border rounded-xl border border-border">
          {schedule.map(([t, e]) => (
            <li key={t} className="flex gap-6 px-6 py-4"><span className="w-16 text-muted-foreground">{t}</span><span>{e}</span></li>
          ))}
        </ol>
      </Section>
      <Section title="FAQ">
        <div className="space-y-3">
          {faq.map(([q, a]) => (
            <details key={q} className="rounded-xl border border-border bg-card px-6 py-4">
              <summary className="cursor-pointer font-medium">{q}</summary>
              <p className="mt-3 text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </Section>
    </main>
  );
}
