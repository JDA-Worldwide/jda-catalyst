# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

JDA Catalyst is a starter template for JDA client websites. Next.js 16 (App Router, React 19) + TypeScript + Tailwind CSS v4 + Sanity CMS. Hosted on Vercel.

## Commands

```bash
npm run dev          # Start dev server (site at :3000, Studio at :3000/studio)
npm run build        # Production build
npm run lint         # ESLint (next/core-web-vitals + typescript)
npm run seed         # Seed Sanity with demo content (requires .env.local)
```

No test framework is configured.

## Architecture

### Routing

- `src/app/(site)/` — Public pages with shared layout (Navigation + Footer)
- `src/app/studio/` — Embedded Sanity Studio at `/studio`
- `src/app/api/` — API routes: contact form, draft-mode toggle, Turnstile verification
- Homepage is the page document with `slug: "home"`

### Page Builder Pattern

Pages are composed of modular sections managed in Sanity. The flow:

1. **Sanity schema** (`src/sanity/schemas/objects/`) defines each module type
2. **pageBuilder schema** (`src/sanity/schemas/objects/pageBuilder.ts`) is an array field that allows all module types
3. **GROQ queries** (`src/sanity/lib/queries.ts`) fetch page data with `modules[] { ... }`
4. **PageBuilder component** (`src/components/PageBuilder.tsx`) maps `_type` to component via `moduleMap`

To add a new module: create schema in `schemas/objects/`, register in `schemas/index.ts`, add to `pageBuilder.ts` array, create component in `components/modules/YourModule/` (index.tsx + types.ts), add to `moduleMap` in `PageBuilder.tsx`.

### Color Scheme System

Every module schema should include `colorSchemeField` and `anchorSlugField` from `src/sanity/schemas/objects/_colorSchemeField.ts` and `_anchorSlugField.ts`. These are reusable field definitions — import and spread them directly into any module's `fields` array.

`PageBuilder.tsx` reads `colorScheme` and applies the corresponding CSS class (`scheme-dark`, `scheme-surface`, `scheme-neutral-1`, `scheme-neutral-2`) to the section wrapper. The `anchorSlug` becomes the element `id` for deep-link navigation, with `scroll-mt-[var(--header-height)]` applied so sticky nav doesn't obscure the target.

Available color schemes (defined in `globals.css`):
- `light` — default, no class applied
- `surface` — warm off-white
- `neutral-1` — lighter client accent neutral
- `neutral-2` — deeper client accent neutral
- `dark` — primary color as background, white text

Update `--header-height` in `globals.css` `:root` whenever the Navigation component changes height.

### GSAP Animation System

GSAP + ScrollTrigger ships as a standard dependency. Key files:

- `src/lib/gsap.ts` — registers ScrollTrigger plugin; always import `gsap` from here, not from `"gsap"` directly
- `src/hooks/useGsap.ts` — `useGsap<T>(animation)` hook that wraps GSAP context for safe cleanup on unmount
- `src/components/ui/AnimateIn/index.tsx` — declarative wrapper for fade-in-up scroll animations

**Usage — `AnimateIn` component:**
```tsx
// Single element fade-in
<AnimateIn><h2>Heading</h2></AnimateIn>

// Staggered children (cards, grid items, etc.)
<AnimateIn stagger staggerAmount={0.08} as="ul">
  {items.map(item => <li key={item._key}>...</li>)}
</AnimateIn>
```

**Usage — `useGsap` hook for custom animations:**
```tsx
"use client";
import { useGsap } from "@/hooks/useGsap";
import { gsap } from "@/lib/gsap";

const ref = useGsap<HTMLDivElement>((el) => {
  gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.6,
    scrollTrigger: { trigger: el, start: "top 85%" }
  });
});
return <div ref={ref}>...</div>;
```

**Rules:**
- `AnimateIn` checks `useIsPreview()` and skips animations inside Sanity Studio — never skip this check in custom animations
- `globals.css` hides `[data-animate-fadeinup]` elements by default and restores them via `body[data-preview]` for Studio preview
- Never import from `"gsap"` directly — always use `"@/lib/gsap"` so ScrollTrigger is registered first

### Sanity Integration

#### Data Fetching (Live Content API)

All data fetching uses `sanityFetch` from `src/sanity/lib/live.ts`, powered by Sanity's Live Content API (`defineLive`). This single function handles:

- **Published content**: Automatic caching and CDN delivery for production visitors
- **Draft content**: When Draft Mode is active (via Presentation tool), fetches unpublished content with a read token
- **Stega encoding**: In Draft Mode, embeds invisible Content Source Map characters in strings for click-to-edit overlays
- **Real-time updates**: The `SanityLive` component (rendered in root layout) subscribes to content changes and triggers re-renders automatically

**Key files:**
- `src/sanity/lib/live.ts` — `defineLive` setup, exports `sanityFetch` and `SanityLive`
- `src/sanity/lib/client.ts` — Base Sanity client with `stega.studioUrl` for overlay linking
- `src/sanity/lib/token.ts` — Server-only read token (Viewer permissions)

**Usage pattern:**
```ts
import { sanityFetch } from "@/sanity/lib/live";

// Page component — stega active in Draft Mode, clean in production
const { data } = await sanityFetch({ query: MY_QUERY });

// generateMetadata — always disable stega to protect SEO tags
const { data } = await sanityFetch({ query: MY_QUERY, stega: false });

// generateStaticParams — published only, no stega
const { data } = await sanityFetch({ query: SLUGS_QUERY, perspective: "published", stega: false });
```

**Important:** Always destructure `{ data }` from the return value. The old `sanityFetch` in `client.ts` returned raw values — the `defineLive` version wraps them in `{ data }`.

#### Visual Editing & Live Preview

The Presentation tool in Sanity Studio enables visual editing:

1. Editor opens Presentation tool → Studio loads the frontend in an iframe
2. Studio calls `/api/draft-mode/enable` → activates Next.js Draft Mode
3. `sanityFetch` detects Draft Mode → returns draft content with stega encoding
4. `<VisualEditingClient />` reads stega strings → renders click-to-edit overlays
5. Editor clicks overlay → Studio navigates to that document/field
6. Editor changes content → `<SanityLive />` picks up mutation → page re-renders

**`VisualEditingClient` vs raw `VisualEditing`:** Always use `src/components/global/VisualEditingClient.tsx`. It disables the built-in `router.refresh()` handler to prevent a double-refresh loop with `SanityLive`.

**`PreviewContext`:** Draft mode state is available via `useIsPreview()` from `src/components/global/PreviewContext.tsx`. The site layout wraps children in `<PreviewProvider isPreview={...}>`. Use this in any component that needs to suppress animations or side effects in preview. When preview is active, `body[data-preview]` is set, which is also used in CSS to restore hidden animated elements.

**Key files:**
- `src/sanity/lib/resolve.ts` — Maps document types to frontend URLs
- `src/app/api/draft-mode/enable/route.ts` — Handshake endpoint for Presentation tool
- `src/app/api/draft-mode/disable/route.ts` — Exit Draft Mode, redirect to homepage
- `src/components/global/PreviewContext.tsx` — Context + `useIsPreview()` hook
- `src/components/global/VisualEditingClient.tsx` — Patched VisualEditing wrapper

#### Stega: The Golden Rule

When Visual Editing is active, string values contain invisible Unicode characters. You **must** clean them before using strings for logic:

```ts
import { stegaClean } from "@sanity/client/stega";

// BAD: stega chars break equality checks
if (colorScheme === "dark") { ... }

// GOOD: clean first
if (stegaClean(colorScheme) === "dark") { ... }
```

This applies to **any** Sanity string used in a conditional: color schemes, variants, platform names, layout options, etc. Don't clean strings used for rendering (`<h1>{title}</h1>`) — those need the stega chars for overlays to work.

**React list keys and stega:** Never use Sanity string fields as React `key` props — stega encoding changes them on every content update, causing unnecessary unmount/remount. Always use:
- `key={item._key}` for Sanity array items
- `key={item._id}` for Sanity document references
- Index only for primitive string arrays with no Sanity strings

#### GROQ Fragments

Reusable query fragments live at the top of `src/sanity/lib/queries.ts`:

- `linkFields` — resolves a `link` object to `{ label, url, isExternal }`, preferring internal `pageRef->slug` over raw URL
- `ctaButtonFields` — same resolution for `ctaButton` objects, includes `variant` and `_key`
- `ctasProjection` — inline projection for a `ctas[]` array of `ctaButton`

Use these in any query that includes link or CTA fields. Raw `label, url, isExternal` without the `coalesce` resolution will break internal page links.

#### Other Sanity Files

- GROQ queries centralized in `src/sanity/lib/queries.ts`
- Presentation tool configured in `src/sanity/sanity.config.ts`
- Singleton documents: globalSettings, navigation, footer (custom desk structure in `src/sanity/lib/structure.ts`)

### Design Tokens

All brand colors, fonts, spacing, and radii are CSS custom properties defined in `src/app/globals.css` using Tailwind v4 `@theme inline`. This is the single file to customize per client. Tokens are consumed as Tailwind utilities (e.g., `bg-brand-primary`, `font-display`, `py-section`).

Key layout tokens:
- `--max-width-container` — full-bleed wrapper width (default 90rem / 1440px)
- `--max-width-content` — content column width (default 75rem / 1200px)
- `--header-height` — used for `scroll-mt` on anchor targets; update when nav height changes

### Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json).

### Component Conventions

- Modules: `src/components/modules/ModuleName/index.tsx` + `types.ts`
- Global components (Navigation, Footer, SkipLink, PreviewContext, VisualEditingClient): `src/components/global/`
- Shared UI (Button, Container, SanityImage, PortableText, AnimateIn, CtaButtons): `src/components/ui/`
- `cn()` utility from `src/lib/utils.ts` for merging Tailwind classes (clsx + tailwind-merge)

### SEO

- JSON-LD generators in `src/lib/jsonLd.tsx` (Organization, WebPage, Article, FAQPage)
- Shared metadata builder in `src/lib/metadata.ts`
- Dynamic sitemap at `src/app/sitemap.ts`, robots at `src/app/robots.ts`
- FAQ modules automatically get FAQPage JSON-LD via PageBuilder
- **Always pass `stega: false`** when fetching data for `generateMetadata` or `generateStaticParams`

### Known Integration Patterns

#### Mapbox (maps, geocoding, geojson boundaries)

Not included in the starter but a known integration pattern. When adding:

1. Install `mapbox-gl` and `@types/mapbox-gl`
2. Add `NEXT_PUBLIC_MAPBOX_TOKEN` to env
3. **Split the component** — Mapbox GL is browser-only. Create `MapboxMap/index.tsx` (server wrapper, accepts config as props) and `MapboxMap/MapboxMapClient.tsx` (`"use client"`, imports mapbox-gl). Pass all data down as props; never import mapbox-gl in a server component.
4. Add geocoding utilities to `src/lib/geocode.ts` — strip stega from address strings with `stegaClean()` before passing to geocoding APIs.
5. See `bgdc` (`bargersville`) codebase for a reference implementation.

### External Services

- **Email**: Resend (`RESEND_API_KEY`) — contact form submissions
- **Bot protection**: Cloudflare Turnstile — shared JDA account, widgets hold multiple client hostnames
- **Analytics**: Vercel Analytics + Speed Insights (injected in root layout)
- **Maps**: Mapbox GL — see Known Integration Patterns above
