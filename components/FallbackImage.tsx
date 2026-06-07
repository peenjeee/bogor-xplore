"use client";

import { ImageOff } from "lucide-react";
import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type FallbackImageProps = Omit<ImageProps, "src"> & {
  src?: string | null;
  fallbackClassName?: string;
};

export function FallbackImage({
  src,
  alt,
  className,
  fallbackClassName,
  onError,
  ...props
}: FallbackImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-[#ffcc00] text-[#111111]",
          fallbackClassName,
        )}
      >
        <div className="flex flex-col items-center gap-3 px-4 text-center">
          <span className="grid size-14 place-items-center border-[3px] border-[#111111] bg-[#00e5ff] shadow-[5px_5px_0_#ff5caf]">
            <ImageOff className="size-7" aria-hidden="true" />
          </span>
          <span className="max-w-48 text-sm font-black uppercase leading-tight">
            Gambar belum tersedia
          </span>
        </div>
      </div>
    );
  }

  return (
    <Image
      {...props}
      alt={alt}
      className={className}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
      src={src}
    />
  );
}
