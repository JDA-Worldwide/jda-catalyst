/**
 * Enable Draft Mode
 * -----------------
 * Called by the Presentation tool when an editor opens the preview iframe.
 * Verifies the request came from a legitimate Studio session, then activates
 * Next.js Draft Mode for the browser session. Once active, `sanityFetch`
 * (from `live.ts`) automatically returns draft content with stega encoding.
 *
 * @see https://www.sanity.io/docs/visual-editing/visual-editing-with-next-js-app-router
 */
import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { client } from "@/sanity/lib/client";
import { token } from "@/sanity/lib/token";

export const { GET } = defineEnableDraftMode({
  client: client.withConfig({ token }),
});
