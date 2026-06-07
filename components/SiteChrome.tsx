"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { LandingFooter } from "@/components/LandingFooter";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showLandingFooter = pathname === "/";
  const showSiteFooter = pathname === "/places" || pathname.startsWith("/places/");

  return (
    <div>
      <SiteHeader />
      {children}
      {showLandingFooter ? <LandingFooter /> : null}
      {showSiteFooter ? <SiteFooter /> : null}
    </div>
  );
}
