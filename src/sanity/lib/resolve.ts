import { defineDocuments, defineLocations } from "sanity/presentation";

export const mainDocuments = defineDocuments([
  {
    route: "/",
    filter: `_type == "page" && slug.current == "home"`,
  },
  {
    route: "/:slug",
    filter: `_type == "page" && slug.current == $slug`,
  },
  {
    route: "/blog/:slug",
    filter: `_type == "blogPost" && slug.current == $slug`,
  },
]);

export const locations = {
  page: defineLocations({
    select: { title: "title", slug: "slug.current" },
    resolve: (doc) => ({
      locations: [
        {
          title: doc?.title || "Untitled",
          href: doc?.slug === "home" ? "/" : `/${doc?.slug}`,
        },
      ],
    }),
  }),
  blogPost: defineLocations({
    select: { title: "title", slug: "slug.current" },
    resolve: (doc) => ({
      locations: [
        {
          title: doc?.title || "Untitled",
          href: `/blog/${doc?.slug}`,
        },
        { title: "Blog", href: "/blog" },
      ],
    }),
  }),
  globalSettings: defineLocations({
    message: "This document is used on all pages",
    tone: "caution",
  }),
  navigation: defineLocations({
    message: "This document is used on all pages",
    tone: "caution",
  }),
  footer: defineLocations({
    message: "This document is used on all pages",
    tone: "caution",
  }),
};
