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
4. `<VisualEditing />` reads stega strings → renders click-to-edit overlays
5. Editor clicks overlay → Studio navigates to that document/field
6. Editor changes content → `<SanityLive />` picks up mutation → page re-renders

**Key files:**
- `src/sanity/lib/resolve.ts` — Maps document types to frontend URLs
- `src/app/api/draft-mode/enable/route.ts` — Handshake endpoint for Presentation tool
- `src/app/api/draft-mode/disable/route.ts` — Exit Draft Mode, redirect to homepage
- `src/components/global/DisableDraftMode.tsx` — Floating exit button (shown outside Studio iframe)

#### Stega: The Golden Rule

When Visual Editing is active, string values contain invisible characters. You **must** clean them before using strings for logic:

```ts
import { stegaClean } from "@sanity/client/stega";

// BAD: stega chars break equality checks
if (align === "center") { ... }

// GOOD: clean first
if (stegaClean(align) === "center") { ... }
```

Don't clean strings used for rendering (`<h1>{title}</h1>`) — those need the stega chars for overlays to work.

#### Other Sanity Files

- GROQ queries centralized in `src/sanity/lib/queries.ts`
- Presentation tool configured in `src/sanity/sanity.config.ts`
- Singleton documents: globalSettings, navigation, footer (custom desk structure in `src/sanity/lib/structure.ts`)

### Environment Variables

| Variable | Purpose | Scope |
|----------|---------|-------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID | Public (client + server) |
| `NEXT_PUBLIC_SANITY_DATASET` | Dataset name (`production`) | Public |
| `NEXT_PUBLIC_SANITY_API_VERSION` | API version date | Public |
| `SANITY_API_TOKEN` | Editor/Admin token for write ops (seed script, contact form) | Server only |
| `SANITY_API_READ_TOKEN` | Viewer token for Live Content API + Draft Mode | Server only |
| `RESEND_API_KEY` | Email sending via Resend | Server only |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL | Public |

### Design Tokens

All brand colors, fonts, spacing, and radii are CSS custom properties defined in `src/app/globals.css` using Tailwind v4 `@theme inline`. This is the single file to customize per client. Tokens are consumed as Tailwind utilities (e.g., `bg-brand-primary`, `font-display`, `py-section`).

### Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json).

### Component Conventions

- Modules: `src/components/modules/ModuleName/index.tsx` + `types.ts`
- Global components (Navigation, Footer, SkipLink, DisableDraftMode): `src/components/global/`
- Shared UI (Button, Container, SanityImage, PortableText): `src/components/ui/`
- `cn()` utility from `src/lib/utils.ts` for merging Tailwind classes (clsx + tailwind-merge)

### SEO

- JSON-LD generators in `src/lib/jsonLd.tsx` (Organization, WebPage, Article, FAQPage)
- Shared metadata builder in `src/lib/metadata.ts`
- Dynamic sitemap at `src/app/sitemap.ts`, robots at `src/app/robots.ts`
- FAQ modules automatically get FAQPage JSON-LD via PageBuilder
- **Always pass `stega: false`** when fetching data for `generateMetadata` or `generateStaticParams`

### External Services

- **Email**: Resend (`RESEND_API_KEY`) — contact form submissions
- **Bot protection**: Cloudflare Turnstile — shared JDA account, widgets hold multiple client hostnames
- **Analytics**: Vercel Analytics + Speed Insights (injected in root layout)
