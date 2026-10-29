import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Card, PageHeader, Section } from "@/components/layout/SiteChrome";
import { site, whatsappUrl } from "@/config/site";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  staticData: { sitemap: true },
  head: () => pageHead("/contact", "Contact HackX", "Questions about HackX 1.0? Message us on WhatsApp or send a note through the contact form."),
  component: ContactPage,
});

const field = "w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground outline-none focus:border-ring";

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = `Hi HackX, I'm ${form.name} (${form.email}).\n\n${form.message}`;
    window.open(whatsappUrl(text), "_blank", "noopener");
  };
  return (
    <main>
      <PageHeader eyebrow="Contact" title="Get in touch" />
      <Section>
        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <p className="eyebrow">WhatsApp</p>
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="mt-2 block text-xl font-semibold">Message us</a>
            <p className="eyebrow mt-6">Website</p>
            <p className="mt-2">{site.domain}</p>
          </Card>
          <form onSubmit={submit} className="space-y-4">
            <input required maxLength={100} placeholder="Name" className={field} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input required type="email" maxLength={255} placeholder="Email" className={field} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <textarea required maxLength={1000} rows={5} placeholder="Message" className={field} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            <button type="submit" className="btn-silver">Send via WhatsApp</button>
          </form>
        </div>
      </Section>
    </main>
  );
}
