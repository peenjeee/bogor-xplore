"use client";

import { m } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RevealText } from "@/components/ui/reveal-text";
import AnimatedTextCycle from "@/components/ui/animated-text-cycle";
import { ExpandingSearchDock } from "@/components/ui/expanding-search-dock-shadcnui";
import { InfiniteGridBackground } from "@/components/ui/infinite-grid-integration";
import { NeoBrutalPlaceGrid, type NeoBrutalGridItem } from "@/components/NeoBrutalPlaceGrid";

const EMPTY_POPULAR_ITEMS: NeoBrutalGridItem[] = [];

const Section1: React.FC = () => {
  const router = useRouter();

  return (
    <m.section
      className="flex h-screen flex-col items-center justify-center overflow-hidden border-b-4 border-[#111111] bg-[#f7f7ef] font-semibold text-black"
    >
      <InfiniteGridBackground gridSize={40} speedX={0.5} speedY={0.5} />

      <RevealText
        text="BogorXplore"
        textColor="text-zinc-900"
        overlayColor="text-[#ff5caf]"
        fontSize="text-[clamp(3rem,9vw,10rem)]"
        letterDelay={0.08}
        overlayDelay={0.05}
        overlayDuration={0.4}
        springDuration={600}
      />
      <h1 className="relative z-10 mt-4 max-w-[760px] px-8 text-center text-4xl font-black leading-tight text-[#111111]">
        Cari rekomendasi destinasi {" "}
        <AnimatedTextCycle
          words={["wisata", "curug", "bukit", "kuliner", "camping", "alam", "rekreasi"]}
          interval={2200}
          className="border-b-4 border-[#111111] bg-[#ffcc00] px-2 font-black text-zinc-900"
        />{" "}
        di Bogor.
      </h1>

      <div className="relative z-10 mt-8 flex justify-center">
        <ExpandingSearchDock
          placeholder="Cari destinasi..."
          onSearch={(query) => {
            router.push(`/places?search=${encodeURIComponent(query)}`);
          }}
        />
      </div>
    </m.section>
  );
};

const Section2: React.FC<{ popularItems: NeoBrutalGridItem[] }> = ({ popularItems }) => {
  if (!popularItems.length) return null;

  return (
    <m.section
      className="relative z-10 overflow-hidden border-y-4 border-[#111111] bg-[#B8FF28] px-4 py-16 text-[#111111] sm:py-20"
    >
      <NeoBrutalPlaceGrid
        title="Destinasi Wisata Populer"
        items={popularItems}
      />
    </m.section>
  );
};

const Section3: React.FC = () => {
  return (
    <m.section className="relative z-10 bg-white px-4 py-16 text-[#111111] sm:py-20">
      <div className="mx-auto flex w-full max-w-6xl justify-center">
        <Link
          href="/places"
          className="inline-flex w-full max-w-xl items-center justify-between gap-5 border-4 border-[#111111] bg-[#111111] px-6 py-5 text-xl font-black uppercase leading-none text-white shadow-[9px_9px_0_#ff5caf] transition-transform hover:-translate-x-1 hover:-translate-y-1 sm:w-auto sm:min-w-[560px] sm:px-8 sm:py-6 sm:text-3xl"
          style={{ color: "#ffffff" }}
        >
          <span>Jelajahi Destinasi</span>
          <ArrowUpRight className="size-6 shrink-0 text-[#ffcc00] sm:size-8" />
        </Link>
      </div>
    </m.section>
  );
};

function Component({ popularItems = EMPTY_POPULAR_ITEMS }: { popularItems?: NeoBrutalGridItem[] }) {
  return (
    <main className="relative bg-[#f7f7ef]">
      <div className="relative bg-[#111111]">
        <Section1 />
        <Section2 popularItems={popularItems} />
        <Section3 />
      </div>
    </main>
  );
}

export default Component;
