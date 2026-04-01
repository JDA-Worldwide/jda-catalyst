/**
 * Disable Draft Mode
 * ------------------
 * Turns off Draft Mode and redirects to the homepage. Called by the
 * `<DisableDraftMode />` button when an editor is viewing the site
 * directly (outside the Presentation tool).
 */
import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  (await draftMode()).disable();
  return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
}
