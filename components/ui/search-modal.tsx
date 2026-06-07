"use client";

import React from "react";
import { Modal, ModalContent, ModalTitle, ModalTrigger } from "@/components/ui/search-modal-base";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem as CommandMenuItem,
  CommandList,
} from "@/components/ui/command";
import { type LucideIcon, SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type CommandItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  icon?: LucideIcon;
  shortcut?: string;
};

type SearchModalProps = {
  children: React.ReactNode;
  data: CommandItem[];
};

export function SearchModal({ children, data }: SearchModalProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((current) => !current);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalTrigger asChild>{children}</ModalTrigger>
      <ModalContent className="p-1">
        <ModalTitle className="sr-only">Search</ModalTitle>
        <Command className="bg-[#f7f7ef] md:bg-card">
          <CommandInput
            className={cn(
              "flex h-12 w-full rounded-none bg-transparent py-3 text-sm font-black placeholder:text-[#3b3b3b] disabled:cursor-not-allowed disabled:opacity-50",
            )}
            placeholder="Cari destinasi..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList className="max-h-[380px] min-h-[380px] px-2 md:px-0">
            <CommandEmpty className="flex min-h-[280px] flex-col items-center justify-center">
              <SearchIcon className="mb-2 size-6 text-muted-foreground" />
              <p className="mb-1 text-xs font-black uppercase text-[#111111]">Tidak ada hasil untuk &quot;{query}&quot;</p>
              <Button onClick={() => setQuery("")} variant="ghost">
                Bersihkan
              </Button>
            </CommandEmpty>
            <CommandGroup>
              {data.map((item, i) => (
                <CommandMenuItem
                  key={item.id || i}
                  className="flex cursor-pointer items-center gap-3"
                  value={item.title}
                  onSelect={() => setOpen(false)}
                >
                  {item.icon && <item.icon className="size-5" />}
                  <div className="flex flex-col">
                    <p className="max-w-[250px] truncate text-sm font-black uppercase">{item.title}</p>
                    <p className="text-xs font-semibold text-[#3b3b3b]">{item.description}</p>
                  </div>
                  <p className="ml-auto border-2 border-[#111111] bg-[#00e5ff] px-2 py-1 text-xs font-black uppercase text-[#111111]">{item.category}</p>
                </CommandMenuItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </ModalContent>
    </Modal>
  );
}
