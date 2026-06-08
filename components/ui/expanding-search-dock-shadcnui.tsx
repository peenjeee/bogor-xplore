"use client";

import type React from "react";
import { AnimatePresence, m } from "motion/react";
import { Search, X } from "lucide-react";
import { useState } from "react";

type ExpandingSearchDockProps = {
  onSearch?: (query: string) => void;
  placeholder?: string;
};

export function ExpandingSearchDock({
  onSearch,
  placeholder = "Search...",
}: ExpandingSearchDockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState("");

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleCollapse = () => {
    setIsExpanded(false);
    setQuery("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (onSearch && trimmedQuery) {
      onSearch(trimmedQuery);
    }
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <m.button
            key="icon"
            type="button"
            aria-label="Buka pencarian"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={handleExpand}
            className="flex h-14 w-14 items-center justify-center rounded-none border-4 border-[#111111] bg-[#00e5ff] text-[#111111] shadow-[6px_6px_0_#111111] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#32ff7e] hover:shadow-[9px_9px_0_#111111]"
          >
            <Search className="h-6 w-6" />
          </m.button>
        ) : (
          <m.form
            key="input"
            initial={{ scaleX: 0.14, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 0.14, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            onSubmit={handleSubmit}
            className="relative w-[calc(100vw-2rem)] max-w-[420px] origin-center"
          >
            <m.div
              initial={{ backdropFilter: "blur(0px)" }}
              animate={{ backdropFilter: "blur(8px)" }}
              className="relative flex h-16 items-center gap-3 rounded-none border-4 border-[#111111] bg-white px-4 shadow-[8px_8px_0_#111111]"
            >
              <div className="shrink-0">
                <Search className="h-5 w-5 text-[#111111]" />
              </div>
              <input
                aria-label="Cari destinasi"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="h-full min-w-0 flex-1 bg-transparent text-base font-black outline-none placeholder:text-[#3b3b3b]"
              />
              <m.button
                type="button"
                aria-label="Tutup pencarian"
                onClick={handleCollapse}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-[#111111] bg-[#ffcc00] hover:bg-[#ff5caf]"
              >
                <X className="h-4 w-4" />
              </m.button>
            </m.div>
          </m.form>
        )}
      </AnimatePresence>
    </div>
  );
}
