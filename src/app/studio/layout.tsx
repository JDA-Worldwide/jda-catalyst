import type { Metadata } from "next";
import { preloadModule } from "react-dom";

import type { ReactNode } from "react";

/** Org Dashboard ↔ embedded Studio (next-sanity). @see https://www.sanity.io/docs/dashboard/dashboard-configure */
const bridgeScript = "https://core.sanity-cdn.com/bridge.js";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function StudioLayout({ children }: { children: ReactNode }) {
  preloadModule(bridgeScript, { as: "script" });
  return (
    <>
      <script src={bridgeScript} async type="module" />
      {children}
    </>
  );
}
