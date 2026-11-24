import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { PageHeader, Section } from "@/components/layout/SiteChrome";
import { whatsappUrl } from "@/config/site";
import { registerOptions, tracks } from "@/content/site-content";
import { pageHead } from "@/lib/seo";
import { SpotlightCard } from "@/components/SpotlightCard";

export const Route = createFileRoute("/register")({
  staticData: { sitemap: true },
  head: () =>
    pageHead(
      "/register",
      "Register for HackX 1.0 | HackX",
      "Register for HackX 1.0 on 28 December 2026 in under a minute, or register on WhatsApp.",
      { crumb: "Register" },
    ),
  component: RegisterPage,
});

export const registrationSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(100),
  college: z.string().trim().min(1, "Enter your school or college").max(150),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+ ]{8,16}$/, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email").max(255),
  team_size: z.coerce.number().int().min(1).max(4),
  event_slug: z.enum(["hackx-1-0", "general"]),
  track: z.string().max(60).optional().default(""),
});

export const submitRegistrationServerFn = createServerFn({ method: "POST" })
  .validator((d: z.infer<typeof registrationSchema>) => d)
  .handler(async ({ data }) => {
    let saved = false;
    const reasons: string[] = [];

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
          INSERT INTO public.registrations (name, college, phone, email, team_size, track, event_slug)
          VALUES (
            ${data.name},
            ${data.college},
            ${data.phone},
            ${data.email},
            ${data.team_size},
            ${data.track || ""},
            ${data.event_slug}
          );
        `;
        await sql.end();
        saved = true;
      } catch (err: unknown) {
        console.warn("[Register] Postgres insert error:", err);
        reasons.push(
          err instanceof Error ? `Database: ${err.message}` : "Database insert failed",
        );
      }
    }

    // 2. Dual-write or fallback to Supabase if configured
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.from("registrations").insert(data);
      if (!error) {
        saved = true;
      } else {
        reasons.push(`Supabase: ${error.message}`);
      }
    } catch (err: unknown) {
      // Supabase is optional in localdb mode
      reasons.push(
        err instanceof Error ? `Supabase: ${err.message}` : "Supabase insert failed",
      );
    }

    if (saved) {
      // Await sending before returning: serverless hosts may stop background work.
      try {
        const { completeRegistrationConfirmation } = await import("@/lib/registration-confirmation.server");
        return await completeRegistrationConfirmation({
          to: data.email,
          name: data.name,
          college: data.college,
          teamSize: data.team_size,
          track: data.track,
          eventSlug: data.event_slug,
        });
      } catch (err) {
        console.warn("[Register] Could not load email server module:", err);
      }

      return { ok: true, emailSent: false };
    }
    return {
      ok: false,
      error: reasons.length
        ? reasons.join(" · ")
        : "Failed to record registration (no database reachable)",
    };
  });

const field =
  "w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground outline-none focus:border-ring";

function RegisterPage() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [saveError, setSaveError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [event, setEvent] = useState("hackx-1-0");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = registrationSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    setSaveError("");
    setStatus("saving");
    try {
      const res = await submitRegistrationServerFn({ data: parsed.data });
      if (res.ok) {
        setEmailSent(res.emailSent);
        setStatus("done");
      } else {
        setSaveError(res.error || "Unknown error");
        setStatus("error");
      }
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Network or server error");
      setStatus("error");
    }
  };

  const wa = (
    <a
      href={whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-ghost w-full justify-center py-5 text-lg"
    >
      Register on WhatsApp
    </a>
  );

  return (
    <main>
      <PageHeader
        eyebrow="HackX 1.0 · 28 Dec 2026"
        title="Register"
        intro="Takes under a minute."
      />
      <Section>
        {status === "done" ? (
          <SpotlightCard className="max-w-xl rounded-2xl p-8" role="status">
            <h2 className="text-3xl font-semibold tracking-tight">You're in.</h2>
            <p className="mt-3 text-muted-foreground">
              We've saved your registration. Message us on WhatsApp to get event updates.
            </p>
            <p className="mt-3 text-muted-foreground" role="status">
              {emailSent
                ? "Your confirmation email has been sent. Check your inbox or spam folder."
                : "Your registration is saved, but the confirmation email couldn't be sent. Contact us on WhatsApp for confirmation."}
            </p>
            <div className="mt-8">{wa}</div>
          </SpotlightCard>
        ) : (
          <form onSubmit={submit} noValidate className="grid max-w-xl gap-4">
            <fieldset className="grid gap-2 text-sm">
              <legend className="mb-1.5">Registering for</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {registerOptions.map((o, i) => (
                  <label
                    key={o.value}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-input px-4 py-3 has-[:checked]:border-ring has-[:checked]:bg-accent"
                  >
                    <input
                      type="radio"
                      name="event_slug"
                      value={o.value}
                      defaultChecked={i === 0}
                      onChange={() => setEvent(o.value)}
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            </fieldset>
            {[
              ["name", "Name", "text"],
              ["college", "School or college", "text"],
              ["phone", "Phone", "tel"],
              ["email", "Email", "email"],
            ].map(([n, l, t]) => (
              <label key={n} className="grid gap-1.5 text-sm">
                {l}
                <input
                  name={n}
                  type={t}
                  className={field}
                  maxLength={n === "college" ? 150 : n === "email" ? 255 : 100}
                />
                {n && errors[n] && <span className="text-destructive">{errors[n]}</span>}
              </label>
            ))}
            <label className="grid gap-1.5 text-sm">
              Team size
              <select name="team_size" className={field} defaultValue="1">
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            {event === "hackx-1-0" && (
              <label className="grid gap-1.5 text-sm">
                Track interest
                <select name="track" className={field} defaultValue="">
                  <option value="">Not sure yet</option>
                  {tracks.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
            )}
            {status === "error" && (
              <p className="text-sm text-destructive" role="alert">
                Couldn't save{saveError ? `: ${saveError}` : ""}. Try again or register on
                WhatsApp.
              </p>
            )}
            <button
              type="submit"
              disabled={status === "saving"}
              className="btn-silver justify-center"
            >
              {status === "saving" ? "Saving…" : "Register"}
            </button>
            <p className="text-center text-sm text-muted-foreground">or</p>
            {wa}
          </form>
        )}
      </Section>
    </main>
  );
}
