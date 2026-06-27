"use client";

import { cn } from "@/lib/utils";

function VelocityText({
  children,
  tone = "black",
}: {
  children: string;
  baseVelocity?: number;
  tone?: "black" | "cyan" | "pink";
}) {
  return (
    <div className="m-0 flex overflow-hidden whitespace-nowrap py-1 leading-none sm:py-2">
      <div className="flex flex-nowrap gap-8 whitespace-nowrap sm:gap-12">
        {Array.from({ length: 6 }).map((_, index) => (
          <span
            key={`${children}-${index}`}
            className={cn(
              "block select-none text-[clamp(2.6rem,15vw,9rem)] font-black uppercase tracking-normal sm:text-[clamp(3.5rem,10vw,9rem)]",
              tone === "black" && "text-[#111111]",
              tone === "cyan" &&
                "text-[#00e5ff] [text-shadow:3px_3px_0_#111111]",
              tone === "pink" &&
                "text-[#ff5caf] [text-shadow:3px_3px_0_#111111]",
            )}
          >
            {children}
          </span>
        ))}
      </div>
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
