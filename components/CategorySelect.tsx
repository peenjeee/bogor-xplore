"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function CategorySelect({
  categories,
  defaultValue,
}: {
  categories: string[];
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue || "all");

  return (
    <div className="flex min-h-12 items-center gap-3 rounded-none border-[3px] border-[#111111] bg-white px-4 shadow-[4px_4px_0_#111111] focus-within:ring-4 focus-within:ring-[#ff5caf]">
      <SlidersHorizontal className="size-5 shrink-0 text-[#111111]" />
      <input type="hidden" name="category" value={value === "all" ? "" : value} />
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger className="h-auto border-0 bg-transparent p-0 text-base font-black text-[#111111] shadow-none ring-0 focus:translate-x-0 focus:translate-y-0 focus:ring-0 focus:ring-offset-0 focus:shadow-none">
          <SelectValue placeholder="Semua kategori" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua kategori</SelectItem>
          {categories.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
