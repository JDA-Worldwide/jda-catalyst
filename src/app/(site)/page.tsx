import type { Metadata } from "next";
import { sanityFetch } from "@/sanity/lib/live";
import { homepageQuery, settingsQuery } from "@/sanity/lib/queries";
import { sanityTags } from "@/sanity/lib/revalidateTags";
import { buildMetadata } from "@/lib/metadata";
import { JsonLd, webPageSchema } from "@/lib/jsonLd";
import PageBuilder from "@/components/PageBuilder";

interface PageData {
  title: string;
  slug: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: { asset: { _ref: string } };
  };
  modules?: Array<{ _type: string; _key: string; [key: string]: unknown }>;
}

interface GlobalSettings {
  siteTitle?: string;
  siteUrl?: string;
}

export async function generateMetadata(): Promise<Metadata> {
  const [{ data: page }, { data: settings }] = await Promise.all([
    sanityFetch({
      query: homepageQuery,
      tags: sanityTags("page", "teamMember"),
      stega: false,
    }),
    sanityFetch({ query: settingsQuery, tags: sanityTags("globalSettings"), stega: false }),
  ]);

  if (!page) return { title: "Home" };

  const siteUrl = settings?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return buildMetadata(page as PageData, siteUrl);
}

export default async function HomePage() {
  const [{ data: page }, { data: settings }] = await Promise.all([
    sanityFetch({ query: homepageQuery, tags: sanityTags("page", "teamMember") }),
    sanityFetch({ query: settingsQuery, tags: sanityTags("globalSettings") }),
  ]);

  if (!page) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold">JDA Catalyst</h1>
          <p className="mt-4 text-brand-muted">
            Create a page with slug &quot;home&quot; in Sanity Studio to get started.
          </p>
        </div>
      </section>
    );
  }

  const typedPage = page as PageData;
  const typedSettings = settings as GlobalSettings | null;
  const siteUrl = typedSettings?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return (
    <>
      <JsonLd
        data={webPageSchema({
          title: typedPage.seo?.metaTitle || typedPage.title,
          description: typedPage.seo?.metaDescription,
          url: siteUrl,
          organizationName: typedSettings?.siteTitle,
        })}
      />
      <h1 className="sr-only">{typedPage.title}</h1>
      <PageBuilder modules={typedPage.modules} />
    </>
  );
}
