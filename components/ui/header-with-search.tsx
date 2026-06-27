"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, XIcon } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const links = [
  {
    label: "Beranda",
    href: "/",
  },
  {
    label: "Rekomendasi",
    href: "/recommendations",
  },
];

export function Header() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const isPlacesPage = pathname === "/places";

  return (
    <header className="fixed left-0 right-0 top-4 z-50 bg-transparent px-4">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full border-4 border-[#111111] bg-white px-5 py-3 text-[#111111] shadow-[5px_5px_0_#111111] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
        >
          <Image
            src="/images/logo.svg"
            alt=""
            width={28}
            height={28}
            className="size-7"
          />
          <span className="text-lg font-black uppercase leading-none">BogorXplore</span>
        </Link>

        <div className="hidden items-center gap-2 rounded-full border-4 border-[#111111] bg-white px-2 py-2 shadow-[5px_5px_0_#111111] md:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded-full px-6 py-2 text-sm font-black uppercase text-[#111111] transition-colors hover:bg-[#111111] hover:!text-white focus-visible:bg-[#111111] focus-visible:!text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/places"
            onClick={(event) => {
              if (isPlacesPage) event.preventDefault();
            }}
            className="rounded-full bg-[#b8ff28] px-6 py-2 text-sm font-black uppercase text-[#111111] transition-transform hover:-translate-y-0.5 hover:bg-[#111111] hover:!text-white focus-visible:bg-[#111111] focus-visible:!text-white"
          >
            Jelajahi
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid size-12 place-items-center rounded-full border-4 border-[#111111] bg-[#ff9f43] shadow-[5px_5px_0_#111111] md:hidden"
          aria-label="Buka menu"
        >
          <MenuIcon className="size-5 stroke-[3]" />
        </button>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            className={cn("border-l-4 border-[#111111] bg-[#f7f7ef] p-5")}
            showClose={false}
            side="right"
          >
            <SheetTitle className="sr-only">Menu navigasi</SheetTitle>
            <div className="flex items-center justify-between">
              <span className="border-4 border-[#111111] bg-[#b8ff28] px-4 py-2 text-lg font-black uppercase shadow-[5px_5px_0_#111111]">
                Menu
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-12 place-items-center rounded-full border-4 border-[#111111] bg-white shadow-[4px_4px_0_#111111]"
                aria-label="Tutup menu"
              >
                <XIcon className="size-5 stroke-[3]" />
              </button>
            </div>

            <div className="mt-10 grid gap-4">
              {links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-full border-4 border-[#111111] bg-white px-6 py-4 text-base font-black uppercase text-[#111111] shadow-[5px_5px_0_#111111] hover:bg-[#111111] hover:!text-white"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/places"
                onClick={(event) => {
                  if (isPlacesPage) event.preventDefault();
                  setOpen(false);
                }}
                className="rounded-full border-4 border-[#111111] bg-[#b8ff28] px-6 py-4 text-base font-black uppercase text-[#111111] shadow-[5px_5px_0_#111111] hover:bg-[#111111] hover:!text-white"
              >
                Jelajahi
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
