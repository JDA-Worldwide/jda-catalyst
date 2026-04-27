"use client";

import { VisualEditing } from "next-sanity/visual-editing";

/**
 * Wrapper around VisualEditing that disables its built-in refresh handler.
 *
 * By default, VisualEditing calls router.refresh() on every mutation,
 * which triggers revalidatePath("/", "layout") and causes a full
 * server re-render. Combined with PresentationComlink's own
 * router.refresh() inside <SanityLive />, this creates a
 * double-refresh cycle that the Presentation tool interprets as
 * navigation — re-triggering draft-mode/enable and causing a
 * full page reload.
 *
 * Returning a resolved Promise tells VisualEditing "I handled it"
 * without actually triggering a refresh, letting <SanityLive />'s
 * tag revalidation handle data updates on its own.
 */
export default function VisualEditingClient() {
  return <VisualEditing refresh={() => Promise.resolve()} />;
}
