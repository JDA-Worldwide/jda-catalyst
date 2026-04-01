import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { sanityFetch, SanityLive } from "@/sanity/lib/live";
import { settingsQuery } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import { JsonLd, organizationSchema } from "@/lib/jsonLd";
import DisableDraftMode from "@/components/global/DisableDraftMode";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { data: settings } = await sanityFetch({
    query: settingsQuery,
    stega: false,
  });

  const siteTitle = settings?.siteTitle || "JDA Catalyst";

  return {
    title: {
      template: `%s | ${siteTitle}`,
      default: siteTitle,
    },
    description: settings?.defaultSeo?.metaDescription || `Built with ${siteTitle}`,
    metadataBase: new URL(
      settings?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    ),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: settings } = await sanityFetch({ query: settingsQuery });

  const siteUrl = settings?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return (
    <html lang="en">
      <body className="antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:bg-brand-primary focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        {settings && (
          <JsonLd
            data={organizationSchema({
              name: settings.siteTitle || "JDA Catalyst",
              url: siteUrl,
              logo: settings.logo?.asset ? urlFor(settings.logo).width(600).url() : undefined,
              socialLinks: settings.socialLinks,
            })}
          />
        )}
        {children}
        <SanityLive />
        {(await draftMode()).isEnabled && (
          <>
            <VisualEditing />
            <DisableDraftMode />
          </>
        )}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
