/**
 * Cache tags for `sanityFetch({ tags })` and Sanity webhook ISR.
 * Match document `_type` values so `revalidateTag(_type, "max")` invalidates the right fetches.
 */
export const SANITY_ISR_FALLBACK_TAGS: readonly string[] = [
  "sanity",
  "page",
  "blogPost",
  "globalSettings",
  "navigation",
  "footer",
  "teamMember",
];

/** Document-type tags plus the default `sanity` tag used by defineLive. */
export function sanityTags(...documentTypes: string[]): string[] {
  return [...new Set([...documentTypes, "sanity"])];
}
