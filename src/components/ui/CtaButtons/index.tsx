import React from "react";
import { stegaClean } from "@sanity/client/stega";
import { cn } from "@/lib/utils";

export type CtaVariant = "primary" | "secondary" | "outline";

export interface CtaButtonItem {
  _key: string;
  label?: string;
  url?: string;
  isExternal?: boolean;
  variant?: CtaVariant;
}

interface CtaButtonsProps extends React.HTMLAttributes<HTMLDivElement> {
  ctas?: CtaButtonItem[];
}

const variantClasses: Record<CtaVariant, string> = {
  primary:
    "bg-brand-primary text-white border-2 border-brand-primary hover:bg-brand-secondary hover:border-brand-secondary",
  secondary:
    "bg-brand-secondary text-white border-2 border-brand-secondary hover:bg-brand-primary hover:border-brand-primary",
  outline:
    "bg-transparent text-brand-primary border-2 border-brand-primary hover:bg-brand-primary hover:text-white",
};

export default function CtaButtons({ ctas, className, ...divProps }: CtaButtonsProps) {
  const resolved = ctas?.filter((cta) => stegaClean(cta.url));
  if (!resolved?.length) return null;

  return (
    <div {...divProps} className={cn("flex flex-wrap gap-4", className)}>
      {resolved.map((cta) => {
        const href = stegaClean(cta.url)!;
        const variant = (stegaClean(cta.variant) ?? "primary") as CtaVariant;
        return (
          <a
            key={cta._key}
            href={href}
            target={cta.isExternal ? "_blank" : undefined}
            rel={cta.isExternal ? "noopener noreferrer" : undefined}
            className={cn(
              "inline-block rounded-button px-5 py-3 text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
              variantClasses[variant] ?? variantClasses.primary
            )}
          >
            {cta.label}
            {cta.isExternal && (
              <span className="sr-only"> (opens in new tab)</span>
            )}
          </a>
        );
      })}
    </div>
  );
}
