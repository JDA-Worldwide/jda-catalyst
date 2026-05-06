import { defineField } from "sanity";

export const colorSchemeField = defineField({
  name: "colorScheme",
  title: "Color Scheme",
  type: "string",
  options: {
    list: [
      { title: "Light (default)", value: "light" },
      { title: "Surface", value: "surface" },
      { title: "Neutral 1", value: "neutral-1" },
      { title: "Neutral 2", value: "neutral-2" },
      { title: "Dark", value: "dark" },
    ],
    layout: "dropdown",
  },
  initialValue: "light",
  description: "Override the section background color.",
});
