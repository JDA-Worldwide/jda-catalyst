import { draftMode } from "next/headers";
import { sanityFetch } from "@/sanity/lib/live";
import { navigationQuery, footerQuery, settingsQuery } from "@/sanity/lib/queries";
import { sanityTags } from "@/sanity/lib/revalidateTags";
import Navigation from "@/components/global/Navigation";
import Footer from "@/components/global/Footer";
import { PreviewProvider } from "@/components/global/PreviewContext";
import type { NavigationData } from "@/components/global/Navigation/types";
import type { FooterData } from "@/components/global/Footer/types";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ data: navigation }, { data: footer }, { data: settings }, { isEnabled: isPreview }] =
    await Promise.all([
      sanityFetch({ query: navigationQuery, tags: sanityTags("navigation") }),
      sanityFetch({ query: footerQuery, tags: sanityTags("footer") }),
      sanityFetch({ query: settingsQuery, tags: sanityTags("globalSettings") }),
      draftMode(),
    ]);

  return (
    <PreviewProvider isPreview={isPreview}>
      <Navigation data={navigation as NavigationData | null} siteTitle={settings?.siteTitle} />
      <main id="main-content">{children}</main>
      <Footer data={footer as FooterData | null} />
    </PreviewProvider>
  );
}
