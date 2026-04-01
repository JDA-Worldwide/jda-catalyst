/**
 * Sanity Client
 * -------------
 * Base client instance shared across the application.
 *
 * Key configuration:
 *   - `useCdn: true` — Uses Sanity's edge CDN for fast reads. The Live Content
 *     API (`defineLive` in `live.ts`) automatically bypasses the CDN when Draft
 *     Mode is active, so this is always safe to leave enabled.
 *   - `stega.studioUrl` — Tells the `<VisualEditing />` component where to send
 *     editors when they click a content overlay. Points to the embedded Studio
 *     at `/studio`. In production, this resolves to your deployed URL.
 *
 * This client is consumed by:
 *   - `live.ts` — Passed to `defineLive` for data fetching + live subscriptions
 *   - `image.ts` — Used by the image URL builder
 *   - Draft Mode enable route — Authenticated with a token for preview handshake
 *
 * @see https://www.sanity.io/docs/visual-editing/visual-editing-with-next-js-app-router
 */
import { createClient } from "next-sanity";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  useCdn: true,
  stega: {
    studioUrl: "/studio",
  },
});
