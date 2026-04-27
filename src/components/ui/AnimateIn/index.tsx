"use client";

import { useGsap } from "@/hooks/useGsap";
import { useIsPreview } from "@/components/global/PreviewContext";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type AllowedTag = "div" | "ul" | "ol" | "section" | "article" | "aside" | "nav";

interface AnimateInProps {
  children: React.ReactNode;
  className?: string;
  /** HTML tag to render as (default: "div") */
  as?: AllowedTag;
  /** Animate direct children with a stagger instead of the container as one unit */
  stagger?: boolean;
  /** Stagger interval between children (seconds, default: 0.1) */
  staggerAmount?: number;
  /** Animation duration per element (seconds, default: 0.55 for stagger, 0.6 for single) */
  duration?: number;
  /** Additional delay before the animation starts (seconds) */
  delay?: number;
  /** ScrollTrigger start position (default: "top 85%") */
  start?: string;
}

export default function AnimateIn({
  children,
  className,
  as: Tag = "div",
  stagger = false,
  staggerAmount = 0.1,
  duration,
  delay = 0,
  start = "top 85%",
}: AnimateInProps) {
  const isPreview = useIsPreview();
  const ref = useGsap<HTMLElement>((el) => {
    if (isPreview) return;
    if (stagger) {
      const kids = el.children;
      if (!kids.length) return;
      gsap.fromTo(
        kids,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: duration ?? 0.55,
          ease: "power2.out",
          stagger: staggerAmount,
          delay,
          scrollTrigger: {
            trigger: el,
            start,
          },
        }
      );
    } else {
      gsap.fromTo(
        el,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: duration ?? 0.6,
          ease: "power2.out",
          delay,
          scrollTrigger: {
            trigger: el,
            start,
          },
        }
      );
    }
  });

  return (
    // ref cast needed because Tag is a union type but all allowed tags extend HTMLElement
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={cn(className)}>
      {children}
    </Tag>
  );
}
