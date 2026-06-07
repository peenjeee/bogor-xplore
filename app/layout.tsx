import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { MotionProvider } from "@/components/MotionProvider";
import { SiteChrome } from "@/components/SiteChrome";
import { BackToTopButton } from "@/components/ui/back-to-top-button";
import { StringCursor } from "@/components/ui/string-cursor";

export const metadata: Metadata = {
  title: {
    default: "BogorXplore - Rekomendasi Wisata Bogor",
    template: "%s | BogorXplore",
  },
  description:
    "Jelajahi 296 destinasi wisata Bogor, dari wisata alam, rekreasi, kuliner, belanja, sampai seni budaya.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  icons: {
    icon: "/images/logo.svg",
    apple: "/images/logo.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id" data-scroll-behavior="smooth">
      <body className="min-h-screen bg-[#f7f7ef] antialiased">
        <MotionProvider>
          <SiteChrome>{children}</SiteChrome>
          <BackToTopButton />
          <StringCursor />
        </MotionProvider>
      </body>
    </html>
  );
}
