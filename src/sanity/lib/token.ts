/**
 * Sanity API Read Token
 * ---------------------
 * Exports the server-side read token used for:
 *   - Draft Mode: Fetching unpublished content when editors preview in the Presentation tool
 *   - Live Content API: Powering real-time updates via `defineLive`
 *
 * This token must have **Viewer** permissions. It is passed to `defineLive` which
 * securely shares it with the browser only when Draft Mode is active.
 *
 * Set `SANITY_API_READ_TOKEN` in `.env.local`. The variable name follows Sanity's
 * convention (without `NEXT_PUBLIC_` prefix) to ensure it is never bundled into
 * client-side code by Next.js.
 *
 * @see https://www.sanity.io/docs/visual-editing/visual-editing-with-next-js-app-router
 */
export const token = process.env.SANITY_API_READ_TOKEN;

if (!token) {
  throw new Error(
    "Missing environment variable: SANITY_API_READ_TOKEN. " +
      "Create a token with Viewer permissions at https://www.sanity.io/manage " +
      "and add it to .env.local."
  );
}
