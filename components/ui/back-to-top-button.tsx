"use client";

import { ArrowUp } from "lucide-react";
import { useSyncExternalStore } from "react";

function subscribeToScroll(onStoreChange: () => void) {
  window.addEventListener("scroll", onStoreChange, { passive: true });
  return () => window.removeEventListener("scroll", onStoreChange);
}

function getScrollSnapshot() {
  return window.scrollY > 520;
}

function getServerScrollSnapshot() {
  return false;
}

export function BackToTopButton() {
  const visible = useSyncExternalStore(subscribeToScroll, getScrollSnapshot, getServerScrollSnapshot);

  return (
    <button
      type="button"
      aria-label="Kembali ke atas"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={[
        "fixed bottom-5 right-5 z-[90] grid size-14 place-items-center border-4 border-[#111111]",
        "bg-[#B8FF28] text-[#111111] shadow-[6px_6px_0_#111111] transition-all duration-200",
        "hover:-translate-x-1 hover:-translate-y-1 hover:bg-[#ff5caf] hover:text-white",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00e5ff]",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      ].join(" ")}
    >
      <ArrowUp className="size-7 stroke-[4]" />
    </button>
  );
}
