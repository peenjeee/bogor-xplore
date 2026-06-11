import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LocationRecommendations } from "@/components/LocationRecommendations";
import { Button } from "@/components/ui/button";
import { getPlacesForMap } from "@/lib/places";

export const metadata: Metadata = {
  title: "Rekomendasi Lokasi",
  description:
    "Rekomendasi wisata Bogor berdasarkan jarak Haversine dari destinasi terpilih atau lokasi pengguna.",
};

export const dynamic = "force-dynamic";

function valueOf(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function RecommendationsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const selectedPlaceId = Number(valueOf(params.placeId));
  const places = await getPlacesForMap({});

  return (
    <main>
      <section className="relative overflow-hidden border-b-4 border-[#111111] bg-[#ff9f43] pb-14 pt-32 text-[#111111] sm:pb-16 sm:pt-36">
        <div className="relative z-10 mx-auto w-full max-w-6xl px-4">
          <Button asChild variant="outline" className="bg-white">
            <Link href="/places">
              <ArrowLeft className="size-4" />
              Daftar Wisata
            </Link>
          </Button>

          <h1 className="mt-8 max-w-5xl text-5xl font-black uppercase leading-none sm:text-6xl lg:text-7xl">
            Rekomendasi Berdasarkan Lokasi
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-bold leading-8 text-[#111111]">
            Pilih titik awal, lalu sistem mengurutkan destinasi terdekat berdasarkan jarak destinasi wisata atau lokasi anda.
          </p>
        </div>
      </section>

      <LocationRecommendations
        places={places}
        initialPlaceId={Number.isFinite(selectedPlaceId) ? selectedPlaceId : undefined}
      />
    </main>
  );
}
