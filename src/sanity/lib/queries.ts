import { groq } from "next-sanity";

// Reusable GROQ fragment — resolves a `link` object's URL from either a
// pageRef slug (internal) or a plain url string (external).
const linkFields = /* groq */ `
  "label": coalesce(label, pageRef->title),
  isExternal,
  "url": coalesce("/" + pageRef->slug.current, url)
`;

// Reusable GROQ fragment — projects a ctaButton item with resolved URL.
const ctaButtonFields = /* groq */ `
  _key,
  label,
  variant,
  isExternal,
  "url": coalesce("/" + pageRef->slug.current, url)
`;

// Inline projection for a ctas[] array of ctaButton.
export const ctasProjection = /* groq */ `ctas[] { ${ctaButtonFields} }`;

// --- Global ---

export const settingsQuery = groq`
  *[_type == "globalSettings"][0] {
    siteTitle,
    siteUrl,
    logo,
    defaultSeo,
    socialLinks[] {
      _key,
      platform,
      url
    }
  }
`;

export const navigationQuery = groq`
  *[_type == "navigation"][0] {
    "ctaLabel": coalesce(ctaLabel, ctaPage->title),
    "ctaUrl": "/" + ctaPage->slug.current,
    items[] {
      _key,
      "label": coalesce(label, pageRef->title),
      "url": select(isExternal == true => url, "/" + pageRef->slug.current),
      isExternal,
      children[] {
        _key,
        "label": coalesce(label, pageRef->title),
        "url": select(isExternal == true => url, "/" + pageRef->slug.current),
        isExternal
      }
    }
  }
`;

export const footerQuery = groq`
  *[_type == "footer"][0] {
    columns[] {
      _key,
      title,
      links[] {
        _key,
        ${linkFields}
      }
    },
    socialLinks[] {
      _key,
      platform,
      url
    },
    copyrightText
  }
`;

// --- Pages ---

export const allPagesQuery = groq`
  *[_type == "page"] {
    "slug": slug.current
  }
`;

export const pageBySlugQuery = groq`
  *[_type == "page" && slug.current == $slug][0] {
    title,
    "slug": slug.current,
    seo,
    modules[] {
      ...,
      _type == "teamGrid" => {
        heading,
        members[]-> {
          _id,
          name,
          jobTitle,
          photo,
          bio
        }
      }
    }
  }
`;

export const homepageQuery = groq`
  *[_type == "page" && slug.current == "home"][0] {
    title,
    "slug": slug.current,
    seo,
    modules[] {
      ...,
      _type == "teamGrid" => {
        heading,
        members[]-> {
          _id,
          name,
          jobTitle,
          photo,
          bio
        }
      }
    }
  }
`;

// --- Blog ---

export const allBlogPostsQuery = groq`
  *[_type == "blogPost"] | order(publishedAt desc) {
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    featuredImage
  }
`;

export const blogPostBySlugQuery = groq`
  *[_type == "blogPost" && slug.current == $slug][0] {
    title,
    "slug": slug.current,
    author,
    publishedAt,
    excerpt,
    body,
    featuredImage,
    seo
  }
`;
