"use client";

import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(160, 255, 249, 0.34)",
}: {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const [opacity, setOpacity] = useState(0);

  return (
    <div
      ref={divRef}
      onFocus={() => {
        setOpacity(0.7);
      }}
      onBlur={() => {
        setOpacity(0);
      }}
      onMouseEnter={() => setOpacity(0.7)}
      onMouseLeave={() => setOpacity(0)}
      className={cn(
        "group relative overflow-hidden rounded-none border-4 border-[#111111] bg-white shadow-[8px_8px_0_#111111] transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0_#111111]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500"
        style={{ opacity, backgroundColor: spotlightColor }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
