import { defineField } from "sanity";

export const anchorSlugField = defineField({
  name: "anchorSlug",
  title: "Anchor ID",
  type: "slug",
  description:
    'Optional. Used as a URL anchor so other pages can link directly to this section. e.g. "contact-us" → yoursite.com/page#contact-us',
  options: {
    slugify: (input: string) =>
      input.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
  },
  validation: (rule) =>
    rule.custom((slug) => {
      if (!slug?.current) return true;
      return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.current)
        ? true
        : "Anchor ID must contain only lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen.";
    }),
});
