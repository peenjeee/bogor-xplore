"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type GridPatternProps = {
  id: string;
  size: number;
};

function GridPattern({ id, size }: GridPatternProps) {
  return (
    <svg className="h-full w-full">
      <defs>
        <pattern
          id={id}
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${size} 0 L 0 0 0 ${size}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

type InfiniteGridBackgroundProps = {
  className?: string;
  gridSize?: number;
  speedX?: number;
  speedY?: number;
};

export function InfiniteGridBackground({
  className,
  gridSize = 40,
  speedX = 0.5,
  speedY = 0.5,
}: InfiniteGridBackgroundProps) {
  const id = React.useId().replace(/:/g, "");
  void speedX;
  void speedY;

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden bg-[#ebebeb]", className)}
    >
      <div className="pointer-events-none absolute inset-0 z-0 text-[#111111] opacity-[0.1]">
        <GridPattern id={`${id}-base`} size={gridSize} />
      </div>

      <div className="pointer-events-none absolute inset-0 z-0 text-[#111111] opacity-20">
        <GridPattern id={`${id}-active`} size={gridSize * 2} />
      </div>
    </div>
  );
}

export default InfiniteGridBackground;
