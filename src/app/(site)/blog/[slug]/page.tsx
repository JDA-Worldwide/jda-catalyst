import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sanityFetch } from "@/sanity/lib/live";
import { blogPostBySlugQuery, allBlogPostsQuery, settingsQuery } from "@/sanity/lib/queries";
import { sanityTags } from "@/sanity/lib/revalidateTags";
import { urlFor } from "@/sanity/lib/image";
import { formatDate } from "@/lib/utils";
import { buildMetadata } from "@/lib/metadata";
import { JsonLd, articleSchema } from "@/lib/jsonLd";
import PortableText from "@/components/ui/PortableText";
import SanityImage from "@/components/ui/SanityImage";

import type { SanityImageSource } from "@/components/ui/SanityImage/types";

interface BlogPost {
  title: string;
  slug: string;
  author?: string;
  publishedAt: string;
  excerpt?: string;
  body?: unknown[];
  featuredImage?: SanityImageSource;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: { asset: { _ref: string } };
  };
}

interface GlobalSettings {
  siteTitle?: string;
  siteUrl?: string;
}

export async function generateStaticParams() {
  const { data } = await sanityFetch({
    query: allBlogPostsQuery,
    tags: sanityTags("blogPost"),
    perspective: "published",
    stega: false,
  });

  return (data as { slug: string }[]).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [{ data: post }, { data: settings }] = await Promise.all([
    sanityFetch({
      query: blogPostBySlugQuery,
      params: { slug },
      tags: sanityTags("blogPost"),
      stega: false,
    }),
    sanityFetch({ query: settingsQuery, tags: sanityTags("globalSettings"), stega: false }),
  ]);

  if (!post) return {};

  const typedPost = post as BlogPost;
  const typedSettings = settings as GlobalSettings | null;
  const siteUrl = typedSettings?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return buildMetadata(
    { title: typedPost.title, slug: `blog/${typedPost.slug}`, seo: typedPost.seo },
    siteUrl
  );
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [{ data: post }, { data: settings }] = await Promise.all([
    sanityFetch({
      query: blogPostBySlugQuery,
      params: { slug },
      tags: sanityTags("blogPost"),
    }),
    sanityFetch({ query: settingsQuery, tags: sanityTags("globalSettings") }),
  ]);

  if (!post) notFound();

  const typedPost = post as BlogPost;
  const typedSettings = settings as GlobalSettings | null;
  const siteUrl = typedSettings?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return (
    <article className="mx-auto max-w-3xl px-4 py-section">
      <JsonLd
        data={articleSchema({
          headline: typedPost.title,
          description: typedPost.seo?.metaDescription || typedPost.excerpt,
          url: `${siteUrl}/blog/${typedPost.slug}`,
          image: typedPost.featuredImage?.asset
            ? urlFor(typedPost.featuredImage).width(1200).height(630).url()
            : undefined,
          author: typedPost.author,
          datePublished: typedPost.publishedAt,
        })}
      />
      <header className="mb-12">
        <h1 className="font-display text-4xl font-bold lg:text-5xl">
          {typedPost.title}
        </h1>
        <div className="mt-4 flex items-center gap-4 text-brand-muted">
          {typedPost.author && <span>{typedPost.author}</span>}
          <time dateTime={typedPost.publishedAt}>{formatDate(typedPost.publishedAt)}</time>
        </div>
      </header>
      {typedPost.featuredImage?.asset && (
        <div className="relative mb-12 aspect-[16/9] overflow-hidden rounded-lg">
          <SanityImage
            image={typedPost.featuredImage}
            width={1200}
            height={675}
            sizes="(max-width: 768px) 100vw, 48rem"
            priority
            className="rounded-lg"
          />
        </div>
      )}
      {typedPost.body && <PortableText value={typedPost.body} />}
    </article>
  );
}
