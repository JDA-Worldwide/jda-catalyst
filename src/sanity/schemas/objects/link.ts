import { defineType, defineField } from "sanity";

export default defineType({
  name: "link",
  title: "Link",
  type: "object",
  fields: [
    defineField({
      name: "isExternal",
      title: "External Link",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "pageRef",
      title: "Page",
      type: "reference",
      to: [{ type: "page" }],
      hidden: ({ parent }) => (parent as { isExternal?: boolean })?.isExternal === true,
      validation: (rule) =>
        rule.custom((value, { parent }) => {
          const p = parent as { isExternal?: boolean };
          if (!p?.isExternal && !value) return "Required for internal links";
          return true;
        }),
    }),
    defineField({
      name: "url",
      title: "URL",
      type: "string",
      hidden: ({ parent }) => (parent as { isExternal?: boolean })?.isExternal !== true,
      validation: (rule) =>
        rule.custom((value, { parent }) => {
          const p = parent as { isExternal?: boolean };
          if (p?.isExternal && !value) return "Required for external links";
          return true;
        }),
    }),
    defineField({
      name: "label",
      title: "Label Override",
      type: "string",
      description: "Defaults to the page title if left blank",
    }),
  ],
  preview: {
    select: {
      label: "label",
      pageTitle: "pageRef.title",
      url: "url",
      slug: "pageRef.slug.current",
    },
    prepare({ label, pageTitle, url, slug }: { label?: string; pageTitle?: string; url?: string; slug?: string }) {
      return {
        title: label || pageTitle || "Untitled",
        subtitle: url || (slug ? `/${slug}` : ""),
      };
    },
  },
});
