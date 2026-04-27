"use client";

import { createContext, useContext, useEffect } from "react";

export const PreviewContext = createContext(false);

export function PreviewProvider({
  children,
  isPreview,
}: {
  children: React.ReactNode;
  isPreview: boolean;
}) {
  useEffect(() => {
    if (isPreview) {
      document.body.setAttribute("data-preview", "");
    } else {
      document.body.removeAttribute("data-preview");
    }
  }, [isPreview]);

  return (
    <PreviewContext.Provider value={isPreview}>
      {children}
    </PreviewContext.Provider>
  );
}

export const useIsPreview = () => useContext(PreviewContext);
