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
- `src/app/api/` — API routes: contact form, draft-mode toggle, ISR revalidation, Turnstile verification
- Homepage is the page document with `slug: "home"`

### Page Builder Pattern

Pages are composed of modular sections managed in Sanity. The flow:

1. **Sanity schema** (`src/sanity/schemas/objects/`) defines each module type
2. **pageBuilder schema** (`src/sanity/schemas/objects/pageBuilder.ts`) is an array field that allows all module types
3. **GROQ queries** (`src/sanity/lib/queries.ts`) fetch page data with `modules[] { ... }`
4. **PageBuilder component** (`src/components/PageBuilder.tsx`) maps `_type` to component via `moduleMap`

To add a new module: create schema in `schemas/objects/`, register in `schemas/index.ts`, add to `pageBuilder.ts` array, create component in `components/modules/YourModule/` (index.tsx + types.ts), add to `moduleMap` in `PageBuilder.tsx`.

### Sanity Integration

- Client + `sanityFetch` helper in `src/sanity/lib/client.ts` — uses Next.js cache tags for ISR
- GROQ queries centralized in `src/sanity/lib/queries.ts`
- Revalidation via webhook: `POST /api/revalidate` with `x-sanity-secret` header triggers `revalidateTag()` by document type
- Presentation tool live preview configured in `src/sanity/lib/resolve.ts`
- Singleton documents: globalSettings, navigation, footer (custom desk structure in `src/sanity/lib/structure.ts`)

### Design Tokens

All brand colors, fonts, spacing, and radii are CSS custom properties defined in `src/app/globals.css` using Tailwind v4 `@theme inline`. This is the single file to customize per client. Tokens are consumed as Tailwind utilities (e.g., `bg-brand-primary`, `font-display`, `py-section`).

### Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json).

### Component Conventions

- Modules: `src/components/modules/ModuleName/index.tsx` + `types.ts`
- Global components (Navigation, Footer, SkipLink): `src/components/global/`
- Shared UI (Button, Container, SanityImage, PortableText): `src/components/ui/`
- `cn()` utility from `src/lib/utils.ts` for merging Tailwind classes (clsx + tailwind-merge)

### SEO

- JSON-LD generators in `src/lib/jsonLd.tsx` (Organization, WebPage, Article, FAQPage)
- Shared metadata builder in `src/lib/metadata.ts`
- Dynamic sitemap at `src/app/sitemap.ts`, robots at `src/app/robots.ts`
- FAQ modules automatically get FAQPage JSON-LD via PageBuilder

### External Services

- **Email**: Resend (`RESEND_API_KEY`) — contact form submissions
- **Bot protection**: Cloudflare Turnstile — shared JDA account, widgets hold multiple client hostnames
- **Analytics**: Vercel Analytics + Speed Insights (injected in root layout)
