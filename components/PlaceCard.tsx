import { ArrowUpRight, Heart, MapPinned } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { truncateText } from "@/lib/text";
import type { Place } from "@/lib/types";

export function PlaceCard({ place }: { place: Place }) {
  return (
    <Card className="h-full overflow-hidden bg-white transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0_#111111]">
      <Link href={`/places/${place.id}`} className="group flex h-full flex-col">
        <div className="relative aspect-[4/3] overflow-hidden border-b-4 border-[#111111] bg-[#ffcc00]">
          {place.url_gambar ? (
            <Image
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              src={place.url_gambar}
              alt={place.nama}
            />
          ) : (
            <div className="h-full w-full bg-[#ff5caf]" />
          )}
          <Badge className="absolute left-3 top-3 gap-1 bg-[#00e5ff] text-[#111111]">
            <MapPinned className="size-3.5" />
            {place.kategori ?? "Wisata"}
          </Badge>
        </div>

        <CardContent className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-black uppercase leading-snug text-[#111111]">{place.nama}</h3>
            <span className="grid size-9 shrink-0 place-items-center border-[3px] border-[#111111] bg-[#ffcc00] text-[#111111] shadow-[3px_3px_0_#111111] transition-colors group-hover:bg-[#32ff7e]">
              <ArrowUpRight className="size-4" />
            </span>
          </div>
          <p className="mt-3 flex-1 text-sm font-semibold leading-6 text-[#3b3b3b]">
            {truncateText(place.deskripsi, 132)}
          </p>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t-4 border-[#111111] bg-[#f7f7ef] p-5 pt-4 text-sm font-black uppercase">
          <span className="inline-flex items-center gap-2 text-[#111111]">
            <Heart className="size-4" />
            {Number(place.likes ?? 0).toLocaleString("id-ID")}
          </span>
          <span className="text-[#111111]">Detail</span>
        </CardFooter>
      </Link>
    </Card>
  );
}
