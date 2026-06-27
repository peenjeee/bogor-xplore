"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const LocationRecommendationsDynamic = dynamic(
  () => import("@/components/LocationRecommendations").then((mod) => mod.LocationRecommendations),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[72vh] min-h-[540px] items-center justify-center bg-[#f7f7ef] border-y-4 border-[#111111]">
        <div className="flex flex-col items-center gap-4 text-[#111111]">
          <div className="size-10 animate-spin border-4 border-[#111111] border-t-transparent" />
          <span className="text-sm font-black uppercase">Memuat Peta Rekomendasi...</span>
        </div>
      </div>
    ),
  }
);

export function LocationRecommendationsLazy(props: ComponentProps<typeof import("@/components/LocationRecommendations").LocationRecommendations>) {
  return <LocationRecommendationsDynamic {...props} />;
}
