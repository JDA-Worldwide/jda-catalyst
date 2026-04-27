"use client";

import { useRef, useEffect } from "react";
import { gsap } from "@/lib/gsap";

export function useGsap<T extends HTMLElement = HTMLDivElement>(
  animation: (el: T) => void
) {
  const ref = useRef<T>(null);
  const animationRef = useRef(animation);

  useEffect(() => {
    animationRef.current = animation;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => animationRef.current(el), el);
    return () => ctx.revert();
  }, []);

  return ref;
}
