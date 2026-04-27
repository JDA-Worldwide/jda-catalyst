/**
 * Disable Draft Mode Button
 * -------------------------
 * Renders a floating button that lets editors exit Draft Mode when they are
 * viewing the frontend directly in a browser tab (outside the Presentation tool).
 *
 * When the site is loaded inside the Presentation tool's iframe, the Studio
 * controls Draft Mode — showing this button would be redundant and confusing,
 * so it is hidden via `useDraftModeEnvironment`.
 *
 * This component is only mounted when Draft Mode is active (see root layout).
 */
"use client";

import { useDraftModeEnvironment } from "next-sanity/hooks";

export default function DisableDraftMode() {
  const environment = useDraftModeEnvironment();

  // Inside the Presentation tool, the Studio manages Draft Mode
  if (environment !== "live" && environment !== "unknown") return null;

  return (
    // eslint-disable-next-line @next/next/no-html-link-for-pages -- intentional full navigation to API route (not a page)
    <a
      href="/api/draft-mode/disable"
      className="fixed bottom-4 right-4 z-50 rounded-full bg-brand-primary px-4 py-2 text-sm font-medium text-white shadow-lg transition-opacity hover:opacity-90"
    >
      Disable Draft Mode
    </a>
  );
}
