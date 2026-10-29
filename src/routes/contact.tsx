import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Card, PageHeader, Section } from "@/components/layout/SiteChrome";
import { whatsappUrl } from "@/config/site";
import { socials } from "@/content/site-content";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  staticData: { sitemap: true },
  head: () => pageHead("/contact", "Contact HackX", "Reach HackX on WhatsApp, email, Instagram or LinkedIn, or send a short message.", { crumb: "Contact" }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  message: z.string().trim().min(1, "Write a message").max(1000),
});
const field = "w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground outline-none focus:border-ring";

function ContactPage() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const p = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!p.success) return setErrors(Object.fromEntries(p.error.issues.map((i) => [i.path[0], i.message])));
    setErrors({});
    setStatus("saving");
    const { error } = await supabase.from("contact_messages").insert(p.data);
    setStatus(error ? "error" : "done");
  };
  const channels = [
    ["WhatsApp", "Message us", whatsappUrl("Hi HackX")],
    ["Email", socials.email, null],
    ["Instagram", socials.instagram, null],
    ["LinkedIn", socials.linkedin, null],
  ] as const;
  return (
    <main>
      <PageHeader eyebrow="Contact" title="Talk to us." intro="WhatsApp is fastest." />
      <Section>
        <div className="grid gap-10 md:grid-cols-2">
          <div className="grid gap-3">
            {channels.map(([k, v, href]) => (
              <Card key={k}>
                <p className="eyebrow">{k}</p>
                {href ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="mt-2 block text-xl font-semibold">{v} <span className="arrow">→</span></a>
                ) : (
                  <p className="mt-2 text-xl font-semibold">{v}</p>
                )}
              </Card>
            ))}
          </div>
          {status === "done" ? (
            <div className="rounded-2xl border border-border bg-card p-8" role="status">
              <h2 className="text-2xl font-semibold">Thanks, message received.</h2>
              <p className="mt-2 text-muted-foreground">We'll get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="grid content-start gap-4">
              {(["name", "email"] as const).map((n) => (
                <label key={n} className="grid gap-1.5 text-sm capitalize">
                  {n}
                  <input name={n} type={n === "email" ? "email" : "text"} maxLength={n === "email" ? 255 : 100} className={field} />
                  {errors[n] && <span className="normal-case text-destructive">{errors[n]}</span>}
                </label>
              ))}
              <label className="grid gap-1.5 text-sm">
                Message
                <textarea name="message" rows={5} maxLength={1000} className={field} />
                {errors["message"] && <span className="text-destructive">{errors["message"]}</span>}
              </label>
              {status === "error" && <p className="text-sm text-destructive">Couldn't send. Try WhatsApp instead.</p>}
              <button type="submit" disabled={status === "saving"} className="btn-silver justify-center">
                {status === "saving" ? "Sending…" : "Send message"}
              </button>
            </form>
          )}
        </div>
      </Section>
    </main>
  );
}
