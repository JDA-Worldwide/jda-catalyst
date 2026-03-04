import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { presentationTool } from "sanity/presentation";
import { dashboardTool, projectInfoWidget } from "@sanity/dashboard";
import { schemaTypes } from "./schemas";
import { locations, mainDocuments } from "./lib/resolve";
import { structure } from "./lib/structure";
import StudioLogo from "./studio/logo";
import welcomeWidget from "./studio/WelcomeWidget";

export default defineConfig({
  basePath: "/studio",
  name: "jda-catalyst",
  title: "JDA Catalyst",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  icon: StudioLogo,
  plugins: [
    dashboardTool({
      widgets: [welcomeWidget(), projectInfoWidget()],
    }),
    structureTool({ structure }),
    presentationTool({
      resolve: { locations, mainDocuments },
      previewUrl: {
        previewMode: {
          enable: "/api/draft-mode/enable",
        },
      },
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
});
