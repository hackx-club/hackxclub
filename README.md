# HackX

Multi-page TanStack Start / React website. Use Node.js 22+ and Bun.

## Development

```sh
bun install
bun run dev
bun run test
```

## Images

All seven displayed portraits are compressed WebP files in `src/assets` imported directly by the About page. Vite emits hashed image files served by the deployment itself; they do not require Lovable image storage. The logo is local too. Legacy `.asset.json` pointers are retained only to protect older published versions and are not used by the current pages. Never delete their remote objects just to deploy elsewhere.

## Vercel

Import the connected source repository into your Vercel account. Use the **Other** framework preset, install command `bun install`, and build command `bun run build`. Leave the Output Directory unset: Nitro detects Vercel and writes its native `.vercel/output` deployment. Do not add a catch-all static SPA rewrite; the site has server-rendered routes and `/sitemap.xml`.

Set the public environment variables used by the generated browser client: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_SUPABASE_PROJECT_ID`, using the current project's values privately. Never add an administrative key to a `VITE_*` variable. Registrations and contact submissions continue using the existing Lovable Cloud backend and its insert-only policies; moving the website does not migrate the database. Images, however, are completely independent of that backend.

Update the canonical site URL in `src/config/site.ts` to the final public domain if different from `https://hackx.club`. Verify deep links, `/sitemap.xml`, and a registration/contact submission after deployment. Vercel deployment has not been performed from this workspace.

## Other server-capable hosts

The default external target is `node-server`:

```sh
bun run build
node .output/server/index.mjs
```

Deploy the complete `.output` directory, not only the public files. Set `PORT` as required by the host. For another supported Nitro host, set `NITRO_PRESET` to its supported preset before building (for example `vercel` or `cloudflare-module`). A static-files-only host cannot execute this application's SSR server without an additional adapter or an intentional static export.

Lovable preview and publishing keep their managed target automatically. The same source remains usable here. External-host builds and a live Vercel deployment need validation in that hosting environment; no claim of universal platform compatibility is made.
