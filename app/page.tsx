import type { Metadata } from "next";
import Component from "@/components/ui/hero-scroll-animation";
import type { NeoBrutalGridItem } from "@/components/NeoBrutalPlaceGrid";
import { getFeaturedPlaces } from "@/lib/places";
import type { Place } from "@/lib/types";

export const metadata: Metadata = {
  title: {
    absolute: "Beranda | BogorXplore",
  },
  description:
    "Cari rekomendasi wisata Bogor dengan tampilan neo brutalist untuk rute, kuliner, alam, dan rekreasi berikutnya.",
};

function toGridItem(place: Place): NeoBrutalGridItem {
  return {
    id: place.id,
    title: place.nama,
    description: place.deskripsi,
    imageSrc: place.url_gambar,
    href: `/places/${place.id}`,
    category: place.kategori ?? "Wisata",
    likes: place.likes,
  };
}

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const popularItems = (await getFeaturedPlaces(6)).map(toGridItem);

  return <Component popularItems={popularItems} />;
}
