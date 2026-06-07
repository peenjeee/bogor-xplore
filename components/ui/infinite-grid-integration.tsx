"use client";

import * as React from "react";
import {
  m,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  type MotionValue,
} from "motion/react";
import { cn } from "@/lib/utils";

type GridPatternProps = {
  id: string;
  offsetX: MotionValue<number>;
  offsetY: MotionValue<number>;
  size: number;
};

function GridPattern({ id, offsetX, offsetY, size }: GridPatternProps) {
  return (
    <svg className="h-full w-full">
      <defs>
        <m.pattern
          id={id}
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
          x={offsetX}
          y={offsetY}
        >
          <path
            d={`M ${size} 0 L 0 0 0 ${size}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </m.pattern>
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
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const gridOffsetX = useMotionValue(0);
  const gridOffsetY = useMotionValue(0);

  React.useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const host = containerRef.current?.parentElement ?? containerRef.current;
      if (!host) return;

      const { left, top } = host.getBoundingClientRect();
      mouseX.set(event.clientX - left);
      mouseY.set(event.clientY - top);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  useAnimationFrame(() => {
    gridOffsetX.set((gridOffsetX.get() + speedX) % gridSize);
    gridOffsetY.set((gridOffsetY.get() + speedY) % gridSize);
  });

  const maskImage = useMotionTemplate`radial-gradient(300px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

  return (
    <div
      ref={containerRef}
      className={cn("pointer-events-none absolute inset-0 overflow-hidden bg-[#ebebeb]", className)}
    >
      <div className="pointer-events-none absolute inset-0 z-0 text-[#111111] opacity-[0.1]">
        <GridPattern id={`${id}-base`} offsetX={gridOffsetX} offsetY={gridOffsetY} size={gridSize} />
      </div>

      <m.div
        className="pointer-events-none absolute inset-0 z-0 text-[#111111] opacity-45"
        style={{ maskImage, WebkitMaskImage: maskImage }}
      >
        <GridPattern id={`${id}-active`} offsetX={gridOffsetX} offsetY={gridOffsetY} size={gridSize} />
      </m.div>
    </div>
  );
}

export default InfiniteGridBackground;
