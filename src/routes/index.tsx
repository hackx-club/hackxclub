import { createFileRoute, Link } from "@tanstack/react-router";
import { Hero } from "@/components/hero/Hero";
import { CtaBanner, SectionHeading, SponsorMarquee } from "@/components/layout/SiteChrome";
import { hackx1, homeStory, numbers, pillars } from "@/content/site-content";
import { pageHead } from "@/lib/seo";
import { SpotlightCard } from "@/components/SpotlightCard";
import { StackingCards } from "@/components/StackingCards";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () =>
    pageHead(
      "/",
      "HackX | Student & Founder Tech Club in India",
      "HackX is a student and founder tech club in India. We run hackathons and founder meetups. HackX 1.0: 28 Dec 2026, 12 hours.",
    ),
  component: Index,
});

function Index() {
  return (
    <main>
      <Hero />

      <section className="home-story mx-auto max-w-6xl px-6 py-20 md:py-28" aria-label="The HackX story">
        <SectionHeading eyebrow="Why we started" title={homeStory.title} />
        <div className="story-chapters">
          {homeStory.chapters.map((chapter) => (
            <div key={chapter.number} className="story-chapter" data-reveal>
              <span className="story-number" aria-hidden>{chapter.number}</span>
              <div>
                <h3 className="text-2xl font-semibold md:text-3xl">{chapter.title}</h3>
                <p className="mt-4 max-w-xl text-lg text-muted-foreground">{chapter.body}</p>
              </div>
            </div>
          ))}
        </div>
        <Link to="/about" className="mt-10 inline-flex text-sm font-medium" data-reveal>Meet the people behind HackX <span className="arrow ml-2">→</span></Link>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading eyebrow="What we do" title={homeStory.pillarsTitle} />
        <StackingCards items={pillars.map((p) => ({ title: p.title, description: p.body }))} />
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading eyebrow="HackX in numbers" title="Early days. Big plans." />
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {numbers.map((n) => (
            <div key={n.label} data-reveal>
              <p className="headline-lg" data-count={n.value} data-prefix={n.prefix ?? ""} data-suffix={n.suffix}>
                {n.prefix ?? ""}{n.value.toLocaleString("en-IN")}{n.suffix}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{n.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading eyebrow={homeStory.eventEyebrow} title="HackX 1.0" />
        <Link to="/events/hackx-1-0" className="block">
          <SpotlightCard className="card-lift rounded-2xl p-8 md:p-12" data-reveal>
          <div className="grid gap-6 md:grid-cols-5">
            {[["Date", hackx1.date], ["Duration", hackx1.duration], ["Prize pool", hackx1.prize], ["Food", "Included"], ["Venue", hackx1.venue]].map(([k, v]) => (
              <div key={k}><p className="eyebrow">{k}</p><p className="mt-2 text-lg font-semibold">{v}</p></div>
            ))}
          </div>
          <p className="mt-10 text-sm font-medium">See details <span className="arrow">→</span></p>
          </SpotlightCard>
        </Link>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6"><p className="eyebrow mb-6">Sponsors</p></div>
        <SponsorMarquee />
      </section>

      <CtaBanner title={homeStory.ctaTitle} body={homeStory.ctaBody} />
    </main>
  );
}
