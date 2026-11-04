<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- All editable site copy (dates, tracks, FAQ, team, numbers) lives in src/content/site-content.ts; pages read from it so content changes happen in one place.
- Shared menu, footer, WhatsApp button and mobile bar render in src/routes/__root.tsx; every page uses pageHead() from src/lib/seo.ts for title, canonical, share tags and breadcrumb data.
- Registrations and contact messages are insert-only for visitors (no public read), so submitted details stay private.
- The home hero X is src/components/hero/HeroParticleX.tsx (vanilla three.js points, no R3F); it falls back to the static X for reduced motion, no WebGL, or ≤2 CPU cores. Keep the canvas pointer-events:none and its fallback in sync if the hero layout changes.
