/**
 * Live Content API Integration
 * ----------------------------
 * Central data-fetching layer powered by Sanity's Live Content API.
 *
 * `defineLive` returns two exports:
 *
 *   sanityFetch — Server-side fetch function used in all page components.
 *     Automatically handles:
 *       - Published vs. draft content based on Next.js Draft Mode
 *       - Stega encoding (Content Source Maps) for click-to-edit overlays
 *       - Caching and real-time revalidation
 *
 *   SanityLive — Client component rendered in the root layout.
 *     Establishes a persistent connection to the Content Lake and triggers
 *     page re-renders when content changes — both for published updates and
 *     live draft edits in the Presentation tool.
 *
 * Usage in page components:
 *   ```ts
 *   import { sanityFetch } from "@/sanity/lib/live";
 *
 *   const { data } = await sanityFetch({ query: MY_QUERY });
 *   ```
 *
 * Usage notes:
 *   - Always destructure `{ data }` from the return value (not a bare value)
 *   - Pass `stega: false` in `generateMetadata` to keep SEO tags clean
 *   - Pass `perspective: "published"` + `stega: false` in `generateStaticParams`
 *
 * @see https://www.sanity.io/docs/visual-editing/visual-editing-with-next-js-app-router
 */
import { defineLive } from "next-sanity/live";
import { client } from "./client";
import { token } from "./token";

export const { sanityFetch, SanityLive } = defineLive({
  client: client.withConfig({ apiVersion: "2026-02-01" }),
  serverToken: token,
  browserToken: token,
});
