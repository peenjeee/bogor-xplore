import { ArrowUpRight, Heart } from "lucide-react";
import Link from "next/link";
import { FallbackImage } from "@/components/FallbackImage";
import { cn } from "@/lib/utils";
import { truncateText } from "@/lib/text";

export type NeoBrutalGridItem = {
  id: string | number;
  title: string;
  description?: string | null;
  imageSrc?: string | null;
  href?: string;
  category?: string | null;
  meta?: string;
  likes?: number | null;
};

type NeoBrutalPlaceGridProps = {
  items: NeoBrutalGridItem[];
  title?: string;
  eyebrow?: string;
  description?: string;
  className?: string;
  gridClassName?: string;
  headerClassName?: string;
};

const cardTilt = [
  "rotate-1",
  "-rotate-1",
  "rotate-0",
  "rotate-[0.7deg]",
  "-rotate-[0.7deg]",
  "rotate-0",
];

const badgeColors = [
  "bg-[#111111] text-white",
  "bg-[#00e5ff] text-[#111111]",
  "bg-[#ffcc00] text-[#111111]",
  "bg-[#32ff7e] text-[#111111]",
  "bg-[#ff5caf] text-[#111111]",
];

function Thumb({
  src,
  title,
  className,
}: {
  src?: string | null;
  title: string;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden border-4 border-[#111111] bg-[#ffcc00]", className)}>
      <FallbackImage
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        src={src}
        alt={title}
        className="object-cover"
      />
    </div>
  );
}

function NeoBrutalPlaceCard({
  item,
  index,
}: {
  item: NeoBrutalGridItem;
  index: number;
}) {
  const likesLabel =
    item.meta?.replace(/\s*\u2022\s*/g, " - ") ??
    [
      item.category ?? "Wisata",
      item.likes == null ? null : `${Number(item.likes).toLocaleString("id-ID")} likes`,
    ].filter(Boolean).join(" - ");

  const body = (
    <>
      <h3 className="min-h-[2.9rem] text-2xl font-black uppercase leading-[0.92] text-[#111111]">
        {item.title}
      </h3>

      <p className="mt-3 min-h-[3.9rem] text-sm font-bold leading-6 text-[#2c2c2c]">
        {truncateText(item.description, 118) || "Detail destinasi siap untuk dijelajahi."}
      </p>

      <Thumb src={item.imageSrc} title={item.title} className="mt-3 aspect-[4/3] w-full shadow-[8px_8px_0_#ffcc00] transition-shadow group-hover:shadow-[10px_10px_0_#00e5ff]" />

      <div className="mt-5 border-t-4 border-[#111111]" />

      <div className="mt-4 flex items-center justify-between gap-3 text-xs font-black uppercase text-[#111111]">
        <span
          className={cn(
            "inline-flex min-w-0 items-center gap-2 border-[3px] border-[#111111] px-2 py-1 shadow-[3px_3px_0_#111111]",
            badgeColors[index % badgeColors.length],
          )}
        >
          <Heart className="size-4 shrink-0" />
          <span className="truncate">{likesLabel}</span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 border-b-2 border-[#111111]">
          Detail
          <ArrowUpRight className="size-4" />
        </span>
      </div>
    </>
  );

  const className = cn(
    "group relative block h-full border-4 border-[#111111] bg-white p-4 shadow-[8px_8px_0_#111111] transition-all duration-200 hover:-translate-x-2 hover:-translate-y-2 hover:rotate-0 hover:shadow-[16px_16px_0_#111111]",
    cardTilt[index % cardTilt.length],
  );

  if (item.href) {
    return (
      <Link href={item.href} className={className}>
        {body}
      </Link>
    );
  }

  return <article className={className}>{body}</article>;
}

export function NeoBrutalPlaceGrid({
  items,
  title,
  eyebrow,
  description,
  className,
  gridClassName,
  headerClassName,
}: NeoBrutalPlaceGridProps) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl", className)}>
      {title ? (
        <div
          className={cn(
            "mb-10 border-4 border-[#111111] bg-white p-5 text-[#111111] shadow-[8px_8px_0_#111111] sm:p-8",
            headerClassName,
          )}
        >
          {eyebrow ? (
            <span className="inline-flex border-[3px] border-[#111111] bg-[#32ff7e] px-3 py-1 text-xs font-black uppercase shadow-[4px_4px_0_#ff5caf]">
              {eyebrow}
            </span>
          ) : null}
          <h2
            className={cn(
              "text-4xl font-black uppercase leading-[0.92] text-[#111111] sm:text-5xl md:text-6xl",
              eyebrow ? "mt-4" : "mt-0",
            )}
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-4 max-w-3xl text-base font-bold leading-7 text-[#2c2c2c] sm:text-lg">
              {description}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className={cn("grid grid-cols-1 gap-8 px-1 pb-5 pr-5 md:grid-cols-2 lg:grid-cols-3", gridClassName)}>
        {items.map((item, index) => (
          <NeoBrutalPlaceCard key={item.id} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}
