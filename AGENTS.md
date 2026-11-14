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
- Only main page headlines (hero h1 and PageHeader h1) use DecodeText; section titles stay plain. DecodeText uses with reserved glyph widths, aria-label final text and a one-shot IntersectionObserver; animation writes glyphs directly and reduced motion resolves immediately.
- What we do and Mentors share StackingCards built with CSS sticky slots and requestAnimationFrame-throttled scroll updates (slot offsets cached on resize, dimming via an opacity overlay instead of CSS filter) to inner card transforms; reduced motion removes sticky behavior, avoiding dependencies and React per-scroll renders.
- All framed content cards use SpotlightCard, a plain card with only a border highlight on hover: no pointer tracking, backdrop blur or smooth-scroll library, to keep scrolling native and fast.
- All editable site copy (dates, tracks, FAQ, team, numbers) lives in src/content/site-content.ts; pages read from it so content changes happen in one place.
- Page entrances animate opacity only, and scroll reveals observe newly added elements rather than rescanning the document; this keeps sticky layouts stable and headline glyph updates inexpensive. Unobserved content stays visible if JavaScript is unavailable.
- Shared menu, footer, WhatsApp button and mobile bar render in src/routes/__root.tsx; every page uses pageHead() from src/lib/seo.ts for title, canonical, share tags and breadcrumb data.
- Registrations and contact messages are insert-only for visitors (no public read), so submitted details stay private.
- The home hero uses vanilla three.js solid rounded chrome bars (RoundedBoxGeometry) with local studio reflections and a pointer-following light; semantic palette tokens and a shared static X fallback preserve the same artwork without WebGL or motion. Keep the canvas pointer-events:none so navigation remains accessible.
