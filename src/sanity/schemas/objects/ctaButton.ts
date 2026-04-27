import { defineType, defineField } from "sanity";

export default defineType({
  name: "ctaButton",
  title: "CTA Button",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "variant",
      title: "Style",
      type: "string",
      options: {
        list: [
          { title: "Primary (filled)", value: "primary" },
          { title: "Secondary (filled)", value: "secondary" },
          { title: "Outline", value: "outline" },
        ],
        layout: "radio",
      },
      initialValue: "primary",
    }),
    defineField({
      name: "pageRef",
      title: "Internal page",
      type: "reference",
      to: [{ type: "page" }],
      description: "Link to a page within this site. Takes priority over URL.",
    }),
    defineField({
      name: "url",
      title: "External URL",
      type: "url",
      description: "Used if no internal page is selected.",
      validation: (rule) =>
        rule.uri({ scheme: ["http", "https", "mailto", "tel"] }),
    }),
    defineField({
      name: "isExternal",
      title: "Open in new tab",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "variant" },
    prepare({ title, subtitle }) {
      return { title: title || "Button", subtitle: subtitle || "primary" };
    },
  },
});
