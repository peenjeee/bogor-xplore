import Image from "next/image";
import { cn } from "@/lib/utils";

const FOOTER_YEAR = 2026;

export default function AnimatedFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("border-t-4 border-[#111111] bg-[#050505] px-4 py-20 text-white", className)}>
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center text-center">
        <Image
          src="/images/logo.svg"
          alt="BogorXplore"
          width={96}
          height={96}
          className="mb-8 size-20"
        />

        <h2 className="max-w-5xl text-5xl font-black uppercase leading-none text-white sm:text-7xl lg:text-8xl">
          Ayo Jelajahi <span className="text-[#b8ff28]">Bogor</span>
        </h2>

        <p className="mt-6 max-w-xl text-lg font-semibold leading-7 text-white/65 sm:text-xl">
          Temukan destinasi alam, kuliner, rekreasi, dan tempat singgah berikutnya.
        </p>

        <div className="mt-20 flex w-full flex-col gap-4 border-t border-white/15 pt-8 text-sm font-black uppercase text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <span>BogorXplore</span>
          <span>&copy; {FOOTER_YEAR}</span>
        </div>
      </div>
    </footer>
  );
}
