"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const RecommendationRouteMapDynamic = dynamic(
  () => import("@/components/RecommendationRouteMap").then((mod) => mod.RecommendationRouteMap),
  {
    ssr: false,
    loading: () => (
      <section className="border-y-4 border-[#111111] bg-[#B4FA28] py-16 sm:py-20">
        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="mb-8 border-[4px] border-[#111111] bg-white px-5 py-4 shadow-[8px_8px_0_#111111] sm:px-7 sm:py-5">
            <h2 className="text-3xl font-black uppercase leading-none text-[#111111] sm:text-5xl">
              Route Peta Rekomendasi
            </h2>
          </div>
          <div className="relative flex h-[72vh] min-h-[540px] items-center justify-center overflow-hidden border-[4px] border-[#111111] bg-[#f7f7ef] shadow-[12px_12px_0_#111111]">
            <div className="flex flex-col items-center gap-4 text-[#111111]">
              <div className="size-10 animate-spin border-4 border-[#111111] border-t-transparent" />
              <span className="text-sm font-black uppercase">Memuat peta...</span>
            </div>
          </div>
        </div>
      </section>
    ),
  }
);

export function RecommendationRouteMapLazy(props: ComponentProps<typeof import("@/components/RecommendationRouteMap").RecommendationRouteMap>) {
  return <RecommendationRouteMapDynamic {...props} />;
}
