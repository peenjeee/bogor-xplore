"use client";

import { useRef } from "react";
import {
  m,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { cn } from "@/lib/utils";

function wrap(min: number, max: number, value: number) {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
}

function VelocityText({
  children,
  baseVelocity,
  tone = "black",
}: {
  children: string;
  baseVelocity: number;
  tone?: "black" | "cyan" | "pink";
}) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });
  const skew = useTransform(smoothVelocity, [-1200, 1200], [-6, 6]);
  const x = useTransform(baseX, (value) => `${wrap(-50, 0, value)}%`);
  const directionFactor = useRef(1);

  useAnimationFrame((_time, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="m-0 flex overflow-hidden whitespace-nowrap py-1 leading-none sm:py-2">
      <m.div className="flex flex-nowrap gap-8 whitespace-nowrap sm:gap-12" style={{ x }}>
        {Array.from({ length: 6 }).map((_, index) => (
          <m.span
            key={`${children}-${index}`}
            className={cn(
              "block select-none text-[clamp(2.6rem,15vw,9rem)] font-black uppercase tracking-normal sm:text-[clamp(3.5rem,10vw,9rem)]",
              tone === "black" && "text-[#111111]",
              tone === "cyan" &&
                "text-[#00e5ff] [text-shadow:3px_3px_0_#111111]",
              tone === "pink" &&
                "text-[#ff5caf] [text-shadow:3px_3px_0_#111111]",
            )}
            style={{ skewX: skew }}
          >
            {children}
          </m.span>
        ))}
      </m.div>
    </div>
  );
}

export function LandingFooter() {
  return (
    <footer className="relative overflow-hidden border-t-4 border-[#111111] bg-[#ffcc00] text-[#111111]">
      <div className="py-10 pb-24 sm:py-12">
        <VelocityText baseVelocity={-2.3}>BOGOR XPLORE</VelocityText>
        <VelocityText baseVelocity={2} tone="cyan">
          WISATA BOGOR
        </VelocityText>
        <VelocityText baseVelocity={-1.7} tone="pink">
          PILIH RUTE
        </VelocityText>
      </div>
    </footer>
  );
}
