import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Card, PageHeader, Section } from "@/components/layout/SiteChrome";
import { whatsappUrl, PHONE_DISPLAY } from "@/config/site";
import { socials } from "@/content/site-content";
import { pageHead } from "@/lib/seo";
import { SpotlightCard } from "@/components/SpotlightCard";

export const Route = createFileRoute("/contact")({
  staticData: { sitemap: true },
  head: () =>
    pageHead(
      "/contact",
      "Contact HackX",
      "Reach HackX on WhatsApp, email, Instagram or LinkedIn, or send a short message.",
      { crumb: "Contact" },
    ),
  component: ContactPage,
});

export const schema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  message: z.string().trim().min(1, "Write a message").max(1000),
});

export const submitContactMessageServerFn = createServerFn({ method: "POST" })
  .validator((d: z.infer<typeof schema>) => d)
  .handler(async ({ data }) => {
    let saved = false;

    // 1. Try local/direct Postgres first
    const dbUrl = process.env["DATABASE_URL"] || process.env["LOVABLE_DB_MIGRATION_URL"];
    if (dbUrl) {
      try {
        const postgres = (await import("postgres")).default;
        const isLocal =
          dbUrl.includes("localhost") ||
          dbUrl.includes("127.0.0.1") ||
          dbUrl.includes("@postgres:");
        const sql = postgres(dbUrl, {
          max: 1,
          idle_timeout: 5,
          connect_timeout: 5,
          ssl: isLocal ? false : "require",
        });
        await sql`
          INSERT INTO public.contact_messages (name, email, message)
          VALUES (${data.name}, ${data.email}, ${data.message});
        `;
        await sql.end();
        saved = true;
      } catch (err: unknown) {
        console.warn("[Contact] Postgres insert error:", err);
      }
    }

    // 2. Dual-write or fallback to Supabase if configured
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.from("contact_messages").insert(data);
      if (!error) saved = true;
    } catch {
      // Supabase is optional in localdb mode
    }

    if (saved) return { ok: true };
    return { ok: false, error: "Failed to send message" };
  });

const field =
  "w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground outline-none focus:border-ring";

function ContactPage() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const p = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!p.success)
      return setErrors(Object.fromEntries(p.error.issues.map((i) => [i.path[0], i.message])));
    setErrors({});
    setStatus("saving");
    try {
      const res = await submitContactMessageServerFn({ data: p.data });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  };
  const channels = [
    ["WhatsApp", PHONE_DISPLAY, whatsappUrl("Hi HackX")],
    ["Phone", PHONE_DISPLAY, "tel:+919715803110"],
    ["Email", socials.email, `mailto:${socials.email}`],
    ["Instagram", socials.instagram, `https://www.instagram.com/${socials.instagram}/`],
    ["LinkedIn", socials.linkedin, null],
  ] as const;
  return (
    <main>
      <PageHeader eyebrow="Contact" title="Talk to us." intro="WhatsApp is fastest." />
      <Section>
        <div className="grid gap-10 md:grid-cols-2">
          <div className="grid content-start gap-3">
            <Link to="/register" className="btn-silver justify-center">
              Register for an event <span className="arrow">→</span>
            </Link>
            {channels.map(([k, v, href]) => (
              <Card key={k}>
                <p className="eyebrow">{k}</p>
                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block text-xl font-semibold"
                  >
                    {v} <span className="arrow">→</span>
                  </a>
                ) : (
                  <p className="mt-2 text-xl font-semibold">{v}</p>
                )}
              </Card>
            ))}
          </div>
          {status === "done" ? (
            <SpotlightCard className="rounded-2xl p-8" role="status">
              <h2 className="text-2xl font-semibold">Thanks, message received.</h2>
              <p className="mt-2 text-muted-foreground">We'll get back to you soon.</p>
            </SpotlightCard>
          ) : (
            <form onSubmit={submit} noValidate className="grid content-start gap-4">
              {(["name", "email"] as const).map((n) => (
                <label key={n} className="grid gap-1.5 text-sm capitalize">
                  {n}
                  <input
                    name={n}
                    type={n === "email" ? "email" : "text"}
                    maxLength={n === "email" ? 255 : 100}
                    className={field}
                  />
                  {errors[n] && <span className="normal-case text-destructive">{errors[n]}</span>}
                </label>
              ))}
              <label className="grid gap-1.5 text-sm">
                Message
                <textarea name="message" rows={5} maxLength={1000} className={field} />
                {errors["message"] && <span className="text-destructive">{errors["message"]}</span>}
              </label>
              {status === "error" && (
                <p className="text-sm text-destructive">Couldn't send. Try WhatsApp instead.</p>
              )}
              <button
                type="submit"
                disabled={status === "saving"}
                className="btn-silver justify-center"
              >
                {status === "saving" ? "Sending…" : "Send message"}
              </button>
            </form>
          )}
        </div>
      </Section>
    </main>
  );
}
