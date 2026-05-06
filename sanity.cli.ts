import { loadEnvConfig } from "@next/env";
import { defineCliConfig } from "sanity/cli";

// Load `.env*` like Next.js so `sanity` CLI picks up NEXT_PUBLIC_* from `.env.local` locally.
loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

if (!projectId || !dataset) {
  throw new Error(
    "sanity.cli.ts: set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET (e.g. in .env.local or CI env).",
  );
}

export default defineCliConfig({
  api: { projectId, dataset },
});
