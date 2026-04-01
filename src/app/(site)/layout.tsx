import { sanityFetch } from "@/sanity/lib/live";
import { navigationQuery, footerQuery, settingsQuery } from "@/sanity/lib/queries";
import Navigation from "@/components/global/Navigation";
import Footer from "@/components/global/Footer";
import type { NavigationData } from "@/components/global/Navigation/types";
import type { FooterData } from "@/components/global/Footer/types";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ data: navigation }, { data: footer }, { data: settings }] = await Promise.all([
    sanityFetch({ query: navigationQuery }),
    sanityFetch({ query: footerQuery }),
    sanityFetch({ query: settingsQuery }),
  ]);

  return (
    <>
      <Navigation data={navigation as NavigationData | null} siteTitle={settings?.siteTitle} />
      <main id="main-content">{children}</main>
      <Footer data={footer as FooterData | null} />
    </>
  );
}
