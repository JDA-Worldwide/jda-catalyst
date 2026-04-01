import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sanityFetch } from "@/sanity/lib/live";
import { pageBySlugQuery, allPagesQuery, settingsQuery } from "@/sanity/lib/queries";
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

export async function generateStaticParams() {
  const { data: pages } = await sanityFetch({
    query: allPagesQuery,
    perspective: "published",
    stega: false,
  });

  return (pages as { slug: string }[])
    .filter((p) => p.slug && p.slug !== "home")
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [{ data: page }, { data: settings }] = await Promise.all([
    sanityFetch({ query: pageBySlugQuery, params: { slug }, stega: false }),
    sanityFetch({ query: settingsQuery, stega: false }),
  ]);

  if (!page) return {};

  const typedSettings = settings as GlobalSettings | null;
  const siteUrl = typedSettings?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return buildMetadata(page as PageData, siteUrl);
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [{ data: page }, { data: settings }] = await Promise.all([
    sanityFetch({ query: pageBySlugQuery, params: { slug } }),
    sanityFetch({ query: settingsQuery }),
  ]);

  if (!page) notFound();

  const typedPage = page as PageData;
  const typedSettings = settings as GlobalSettings | null;
  const siteUrl = typedSettings?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return (
    <>
      <JsonLd
        data={webPageSchema({
          title: typedPage.seo?.metaTitle || typedPage.title,
          description: typedPage.seo?.metaDescription,
          url: `${siteUrl}/${typedPage.slug}`,
          organizationName: typedSettings?.siteTitle,
        })}
      />
      <h1 className="sr-only">{typedPage.title}</h1>
      <PageBuilder modules={typedPage.modules} />
    </>
  );
}
