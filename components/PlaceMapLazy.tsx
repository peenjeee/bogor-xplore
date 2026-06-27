"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const PlaceMapDynamic = dynamic(
  () => import("@/components/PlaceMap").then((mod) => mod.PlaceMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[72vh] min-h-[540px] w-full bg-[#f7f7ef] border-[4px] border-[#111111] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-[#111111]">
          <div className="size-10 animate-spin border-4 border-[#111111] border-t-transparent" />
          <span className="text-sm font-black uppercase">Memuat Peta...</span>
        </div>
      </div>
    ),
  }
);

export function PlaceMapLazy(props: ComponentProps<typeof import("@/components/PlaceMap").PlaceMap>) {
  return <PlaceMapDynamic {...props} />;
}
