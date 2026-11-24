import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState, useEffect, useMemo } from "react";

export interface Registration {
  id: string;
  name: string;
  college: string;
  phone: string;
  email: string;
  team_size: number;
  track: string;
  event_slug: string;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

// Define the server function to fetch registrations and contact messages securely.
export const fetchAdminDataServerFn = createServerFn({ method: "POST" })
  .validator((d: { user: string; pass: string }) => d)
  .handler(async ({ data }) => {
    if (data.user !== "hackxclub" || data.pass !== "hackxclub123") {
      return { ok: false, authed: false, error: "Invalid username or password" };
    }

    let registrations: Registration[] = [];
    let messages: ContactMessage[] = [];
    let dbWarning: string | null = null;

    // 1. Try fetching via direct Postgres connection first (bypasses RLS)
    const dbUrl = process.env["LOVABLE_DB_MIGRATION_URL"] || process.env["DATABASE_URL"];
    if (dbUrl) {
      try {
        const postgres = (await import("postgres")).default;
        const isLocal =
          dbUrl.includes("localhost") ||
          dbUrl.includes("127.0.0.1") ||
          dbUrl.includes("@postgres:");
        // Supabase requires SSL encryption; local Docker Postgres runs without SSL
        const sql = postgres(dbUrl, {
          max: 1,
          idle_timeout: 5,
          connect_timeout: 5,
          ssl: isLocal ? false : "require",
        });
        try {
          const regRows = await sql`
            SELECT id, name, college, phone, email, team_size, track, event_slug, created_at 
            FROM public.registrations 
            ORDER BY created_at DESC;
          `;
          const msgRows = await sql`
            SELECT id, name, email, message, created_at 
            FROM public.contact_messages 
            ORDER BY created_at DESC;
          `;
          registrations = regRows as unknown as Registration[];
          messages = msgRows as unknown as ContactMessage[];
          await sql.end();
          return {
            ok: true,
            authed: true,
            registrations,
            messages,
            source: "PostgreSQL Direct",
          };
        } catch (dbErr: unknown) {
          const errMessage = dbErr instanceof Error ? dbErr.message : "Unknown error";
          console.warn("[Admin Server] Direct Postgres query failed:", errMessage);
          dbWarning = `Postgres direct connection failed (${errMessage}).`;
          await sql.end().catch(() => {});
        }
      } catch (err: unknown) {
        const errMessage = err instanceof Error ? err.message : "Initialization error";
        console.warn("[Admin Server] Failed to initialize postgres client:", errMessage);
        dbWarning = `Postgres client initialization failed (${errMessage}).`;
      }
    }

    // 2. Try fetching via Supabase Admin Client with SUPABASE_SERVICE_ROLE_KEY (bypasses RLS over HTTPS)
    const serviceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
    const supabaseUrl = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"];
    if (serviceRoleKey && supabaseUrl) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const adminClient = createClient(supabaseUrl, serviceRoleKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const [regRes, msgRes] = await Promise.all([
          adminClient.from("registrations").select("*").order("created_at", { ascending: false }),
          adminClient
            .from("contact_messages")
            .select("*")
            .order("created_at", { ascending: false }),
        ]);

        if (!regRes.error && !msgRes.error) {
          return {
            ok: true,
            authed: true,
            registrations: (regRes.data as unknown as Registration[]) ?? [],
            messages: (msgRes.data as unknown as ContactMessage[]) ?? [],
            source: "Supabase Service Role (HTTPS)",
            warning: dbWarning,
          };
        } else {
          console.warn("[Admin Server] Service role query error:", regRes.error || msgRes.error);
        }
      } catch (adminErr: unknown) {
        const errMessage = adminErr instanceof Error ? adminErr.message : "Client error";
        console.warn("[Admin Server] Supabase service role client error:", errMessage);
      }
    }

    // 3. Fallback to public anon Supabase client
    try {
      const publicUrl = process.env["VITE_SUPABASE_URL"] || process.env["SUPABASE_URL"];
      const publicAnonKey =
        process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || process.env["SUPABASE_PUBLISHABLE_KEY"];
      if (!publicUrl || !publicAnonKey) {
        return {
          ok: true,
          authed: true,
          registrations: [],
          messages: [],
          source: "Unconfigured",
          warning: dbWarning,
          error:
            "Database connection not available. In Vercel, please add SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL to your Vercel Project Settings > Environment Variables.",
        };
      }
      const { supabase } = await import("@/integrations/supabase/client");
      const [regRes, msgRes] = await Promise.all([
        supabase.from("registrations").select("*").order("created_at", { ascending: false }),
        supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
      ]);

      if (regRes.error || msgRes.error) {
        const errDetails = regRes.error?.message || msgRes.error?.message || "Permission denied";
        return {
          ok: true,
          authed: true,
          registrations: [],
          messages: [],
          source: "Supabase Anon (Blocked by RLS)",
          warning: dbWarning,
          error: `Row Level Security (RLS) blocked access: ${errDetails}. In Supabase, registrations are private from public anon keys. Please add SUPABASE_SERVICE_ROLE_KEY to your .env file to view records.`,
        };
      }

      return {
        ok: true,
        authed: true,
        registrations: (regRes.data as unknown as Registration[]) ?? [],
        messages: (msgRes.data as unknown as ContactMessage[]) ?? [],
        source: "Supabase Anon",
        warning: dbWarning,
      };
    } catch (e: unknown) {
      const errMessage = e instanceof Error ? e.message : "Fetch error";
      return {
        ok: true,
        authed: true,
        registrations: [],
        messages: [],
        source: "Failed",
        warning: dbWarning,
        error: errMessage || "Failed to fetch admin data",
      };
    }
  });

export const Route = createFileRoute("/admin")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Admin Portal | HackX" },
      { name: "description", content: "Private HackX registration and contact administration." },
      { property: "og:title", content: "Admin Portal | HackX" },
      { property: "og:description", content: "Private HackX registration and contact administration." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [authed, setAuthed] = useState<boolean>(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<"registrations" | "messages">("registrations");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [dataSource, setDataSource] = useState<string>("");
  const [dataWarning, setDataWarning] = useState<string>("");
  const [dataError, setDataError] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("all");

  // Check existing session
  useEffect(() => {
    const savedAuth = sessionStorage.getItem("hx_admin_auth");
    const savedUser = sessionStorage.getItem("hx_admin_user");
    const savedPass = sessionStorage.getItem("hx_admin_pass");
    if (savedAuth === "true" && savedUser && savedPass) {
      setUsername(savedUser);
      setPassword(savedPass);
      loadData(savedUser, savedPass);
    }
  }, []);

  const loadData = async (user: string, pass: string) => {
    setLoading(true);
    setAuthError("");
    setDataWarning("");
    setDataError("");
    try {
      const res = await fetchAdminDataServerFn({ data: { user, pass } });
      if (res.authed) {
        setAuthed(true);
        setRegistrations((res.registrations as Registration[]) || []);
        setMessages((res.messages as ContactMessage[]) || []);
        setDataSource(res.source || "postgres");
        if (res.warning) setDataWarning(res.warning);
        if (res.error) setDataError(res.error);
        sessionStorage.setItem("hx_admin_auth", "true");
        sessionStorage.setItem("hx_admin_user", user);
        sessionStorage.setItem("hx_admin_pass", pass);
      } else {
        setAuthError(res.error || "Invalid username or password");
        setAuthed(false);
      }
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : "Failed to load admin data";
      setAuthError(errMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(username.trim().toLowerCase(), password.trim());
  };

  const handleLogout = () => {
    sessionStorage.removeItem("hx_admin_auth");
    sessionStorage.removeItem("hx_admin_user");
    sessionStorage.removeItem("hx_admin_pass");
    setAuthed(false);
    setUsername("");
    setPassword("");
    setRegistrations([]);
    setMessages([]);
  };

  const exportCSV = () => {
    if (!registrations.length) return;
    const headers = [
      "Name",
      "College",
      "Email",
      "Phone",
      "Team Size",
      "Track",
      "Event",
      "Submitted At",
    ];
    const rows = registrations.map((r) => [
      `"${(r.name || "").replace(/"/g, '""')}"`,
      `"${(r.college || "").replace(/"/g, '""')}"`,
      `"${(r.email || "").replace(/"/g, '""')}"`,
      `"${(r.phone || "").replace(/"/g, '""')}"`,
      r.team_size || 1,
      `"${(r.track || "").replace(/"/g, '""')}"`,
      `"${(r.event_slug || "").replace(/"/g, '""')}"`,
      `"${r.created_at || ""}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `hackx_registrations_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((r) => {
      const matchesSearch =
        searchQuery === "" ||
        r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.college?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.phone?.includes(searchQuery);

      const matchesTrack = selectedTrack === "all" || r.track === selectedTrack;
      return matchesSearch && matchesTrack;
    });
  }, [registrations, searchQuery, selectedTrack]);

  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      return (
        searchQuery === "" ||
        m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.message?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [messages, searchQuery]);

  // LOGIN SCREEN
  if (!authed) {
    return (
      <div className="flex min-h-[90vh] items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-8 shadow-2xl">
          <div className="text-center">
            <span className="inline-block rounded-full border border-border px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
              Internal Portal
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">HackX Admin</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter credentials to view submitted registrations and messages.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            {authError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {authError}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Username
              </label>
              <input
                type="text"
                autoFocus
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground outline-none transition-colors focus:border-ring"
                placeholder="hackxclub"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground outline-none transition-colors focus:border-ring"
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-silver w-full justify-center py-3 text-base cursor-pointer disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Sign In to Admin"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // AUTHENTICATED DASHBOARD
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">HackX Admin</h1>
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              Active ({dataSource})
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Private management console for registrations and contact inquiries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData(username, password)}
            disabled={loading}
            className="btn-ghost btn-sm text-xs cursor-pointer"
          >
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
          {activeTab === "registrations" && (
            <button onClick={exportCSV} className="btn-silver btn-sm text-xs cursor-pointer">
              ↓ Export CSV
            </button>
          )}
          <button
            onClick={handleLogout}
            className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Database Diagnostic Notices */}
      {dataError && (
        <div className="mt-6 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-xs text-destructive">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <span>⚠️</span> Database Access Notice
          </div>
          <p className="mt-1.5 leading-relaxed">{dataError}</p>
          <div className="mt-3 rounded-lg border border-border/60 bg-background/50 p-3 text-muted-foreground">
            <span className="font-semibold text-foreground">How to resolve:</span>
            <ul className="mt-1 list-disc pl-5 space-y-1">
              <li>
                <strong>Option A (Recommended):</strong> Add{" "}
                <code className="font-mono text-foreground bg-muted px-1.5 py-0.5 rounded">
                  SUPABASE_SERVICE_ROLE_KEY="..."
                </code>{" "}
                to your{" "}
                <code className="font-mono text-foreground bg-muted px-1.5 py-0.5 rounded">
                  .env
                </code>{" "}
                file (from Supabase Dashboard &gt; Project Settings &gt; API &gt; service_role
                secret). This connects securely over HTTPS and bypasses RLS.
              </li>
              <li>
                <strong>Option B:</strong> Check your{" "}
                <code className="font-mono text-foreground bg-muted px-1.5 py-0.5 rounded">
                  DATABASE_URL
                </code>{" "}
                or{" "}
                <code className="font-mono text-foreground bg-muted px-1.5 py-0.5 rounded">
                  LOVABLE_DB_MIGRATION_URL
                </code>{" "}
                in{" "}
                <code className="font-mono text-foreground bg-muted px-1.5 py-0.5 rounded">
                  .env
                </code>{" "}
                to ensure the PostgreSQL pooler and password are correct.
              </li>
            </ul>
          </div>
        </div>
      )}

      {dataWarning && !dataError && (
        <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-200">
          <span className="font-semibold text-amber-300">Connection notice:</span> {dataWarning}
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase">Total Registrations</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{registrations.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase">Solo Participants</p>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {registrations.filter((r) => r.team_size === 1).length}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase">Teams (2-4)</p>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {registrations.filter((r) => r.team_size > 1).length}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase">Contact Inquiries</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{messages.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-2 border-b border-border pb-px">
        <button
          onClick={() => setActiveTab("registrations")}
          className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === "registrations"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Registrations ({filteredRegistrations.length})
        </button>
        <button
          onClick={() => setActiveTab("messages")}
          className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === "messages"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Contact Messages ({filteredMessages.length})
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder={
              activeTab === "registrations"
                ? "Search by name, college, email..."
                : "Search messages..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground outline-none focus:border-ring"
          />
        </div>

        {activeTab === "registrations" && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Track:</span>
            <select
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-ring cursor-pointer"
            >
              <option value="all">All Tracks</option>
              <option value="AI & Automation">AI & Automation</option>
              <option value="Industry & Supply Chain (Industry 5.0)">
                Industry & Supply Chain
              </option>
              <option value="Climate & Agritech">Climate & Agritech</option>
              <option value="Open Track">Open Track</option>
            </select>
          </div>
        )}
      </div>

      {/* Tab 1: Registrations Table */}
      {activeTab === "registrations" && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
          {filteredRegistrations.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              {registrations.length === 0
                ? "No registrations recorded yet."
                : "No matching registrations found."}
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">College</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Team</th>
                  <th className="px-4 py-3">Track</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredRegistrations.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{r.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.college}</td>
                    <td className="px-4 py-3 text-xs">
                      <div>{r.email}</div>
                      <div className="font-mono text-muted-foreground">{r.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="rounded-md border border-border px-2 py-0.5 text-xs">
                        {r.team_size} {r.team_size === 1 ? "pers" : "members"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="rounded-full bg-secondary px-2.5 py-1 text-secondary-foreground">
                        {r.track || "Not specified"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="font-mono text-muted-foreground">{r.event_slug}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(r.created_at).toLocaleDateString()}{" "}
                      {new Date(r.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 2: Contact Messages Table */}
      {activeTab === "messages" && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
          {filteredMessages.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              {messages.length === 0
                ? "No contact inquiries received yet."
                : "No matching inquiries found."}
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Sender</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3">Received At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredMessages.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                      {m.name}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`mailto:${m.email}`}
                        className="text-primary hover:underline text-xs"
                      >
                        {m.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-md">{m.message}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(m.created_at).toLocaleDateString()}{" "}
                      {new Date(m.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
