"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showSiteFooter =
    pathname === "/" || pathname === "/places" || pathname.startsWith("/places/") || pathname === "/recommendations";

  return (
    <div>
      <SiteHeader />
      {children}
      {showSiteFooter ? <SiteFooter /> : null}
    </div>
  );
}
