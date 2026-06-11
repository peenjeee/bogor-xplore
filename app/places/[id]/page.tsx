import type { Metadata } from "next";
import { ArrowLeft, ExternalLink, Heart, LocateFixed, MapPinned, Tags } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FallbackImage } from "@/components/FallbackImage";
import { NeoBrutalPlaceGrid, type NeoBrutalGridItem } from "@/components/NeoBrutalPlaceGrid";
import { RecommendationRouteMap } from "@/components/RecommendationRouteMap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRecommendationsFromFlask } from "@/lib/flask-api";
import { getFallbackRecommendations, getPlaceById } from "@/lib/places";
import { extractInlineArticleTags, extractSection, paragraphs, truncateText } from "@/lib/text";
import type { Place } from "@/lib/types";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const place = await getPlaceById(Number(id));
  if (!place) return {};

  return {
    title: place.nama,
    description: truncateText(place.deskripsi, 155),
    openGraph: {
      title: `${place.nama} - BogorXplore`,
      description: truncateText(place.deskripsi, 155),
      images: place.url_gambar ? [place.url_gambar] : [],
    },
  };
}

export default async function PlaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const place = await getPlaceById(Number(id));
  if (!place) notFound();

  const [flaskRecommendations, fallbackRecommendations] = await Promise.all([
    getRecommendationsFromFlask(place, 6),
    getFallbackRecommendations(place, 6),
  ]);

  const recommendations = flaskRecommendations.length ? flaskRecommendations : fallbackRecommendations;
  const alamat = place.alamat ?? extractSection(place.deskripsi, "Alamat");
  const fasilitas = place.fasilitas ?? extractSection(place.deskripsi, "Fasilitas");
  const hargaTiket = place.harga_tiket ?? extractSection(place.deskripsi, "Harga Tiket");
  const jam = place.jam_operasional ?? extractSection(place.deskripsi, "Jam Operasional");
  const tags =
    place.tags?.split(",").flatMap((item) => {
      const tag = item.trim();
      return tag ? [tag] : [];
    }) ??
    extractInlineArticleTags(place.deskripsi);
  const content = paragraphs(place.deskripsi, 10);

  return (
    <main>
      <section className="relative overflow-hidden border-b-4 border-[#111111] bg-[#00e5ff] pb-12 pt-32 text-[#111111] sm:pb-16 sm:pt-36">

        <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-8 px-4 lg:grid-cols-[1.04fr_0.96fr] lg:items-center">
          <div>
            <nav className="flex flex-wrap items-center gap-2 text-sm font-black uppercase text-[#111111]" aria-label="Breadcrumb">
              <Link className="border-b-2 border-[#111111] hover:bg-[#ffcc00]" href="/">
                Beranda
              </Link>
              <span>/</span>
              <Link className="border-b-2 border-[#111111] hover:bg-[#ffcc00]" href="/places">
                Wisata
              </Link>
              <span>/</span>
              <span>{place.nama}</span>
            </nav>

            <h1 className="mt-6 max-w-5xl text-5xl font-black uppercase leading-none sm:text-6xl lg:text-7xl">
              {place.nama}
            </h1>


            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Badge className="gap-2 bg-[#ffcc00] text-[#111111]">
                <MapPinned className="size-4" />
                {place.kategori ?? "Wisata"}
              </Badge>
              <Badge variant="outline" className="gap-2 bg-white text-[#111111]">
                <Heart className="size-4" />
                {Number(place.likes ?? 0).toLocaleString("id-ID")} likes
              </Badge>
            </div>
          </div>

          <Card className="overflow-hidden bg-white">
            <div className="relative aspect-[4/3] bg-[#ffcc00]">
              <FallbackImage
                src={place.url_gambar}
                alt={place.nama}
                fill
                priority
                sizes="(min-width: 1024px) 44vw, 100vw"
                className="object-cover"
              />
            </div>
          </Card>
        </div>
      </section>

      <section className="bg-transparent py-12 sm:py-16">
        <div className="mx-auto w-full max-w-6xl px-4">
          <Button asChild variant="outline">
            <Link href="/places">
              <ArrowLeft className="size-4" />
              Kembali ke daftar
            </Link>
          </Button>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-3xl font-black text-[#111111]">Tentang Destinasi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {content.length ? (
                    content.map((item, index) => (
                      <p key={`${item}-${index}`} className="text-base font-semibold leading-8 text-[#2c2c2c]">
                        {item}
                      </p>
                    ))
                  ) : (
                    <p className="text-base font-semibold leading-8 text-[#2c2c2c]">Detail destinasi belum tersedia.</p>
                  )}
                </div>

                {tags.length ? (
                  <div className="mt-8 border-t-4 border-[#111111] pt-6">
                    <h2 className="text-2xl font-black uppercase text-[#111111]">Tag</h2>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {tags.slice(0, 12).map((tag) => (
                        <Badge className="gap-2 bg-[#32ff7e] text-[#111111]" key={tag}>
                          <Tags className="size-3.5" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <aside className="grid gap-4 lg:top-24">
              <Card className="bg-[#111111] text-white shadow-[8px_8px_0_#ff5caf]">
                <CardHeader>
                  <CardTitle className="text-xl font-black text-white">Info Kunjungan</CardTitle>
                </CardHeader>
                <CardContent>
                  {[
                    ["Kategori", place.kategori ?? "-"],
                    ["Alamat", alamat ?? "Bogor, Jawa Barat"],
                    ["Fasilitas", fasilitas ?? "Info belum tersedia"],
                    ["Harga Tiket", hargaTiket ?? "Info belum tersedia"],
                    ["Jam Operasional", jam ?? "Info belum tersedia"],
                  ].map(([label, value]) => (
                    <div key={label} className="border-b-4 border-white/25 py-4 first:pt-0 last:border-b-0 last:pb-0">
                      <span className="block text-xs font-black uppercase text-[#ffcc00]">{label}</span>
                      <span className="mt-2 block text-sm font-bold leading-6 text-white/90">{value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Button asChild variant="secondary" className="w-full">
                <Link href={`/recommendations?placeId=${place.id}`}>
                  Rekomendasi Terdekat
                  <LocateFixed className="size-4" />
                </Link>
              </Button>

              {place.url ? (
                <Button asChild variant="secondary" className="w-full">
                  <Link href={place.url} target="_blank" rel="noreferrer">
                    Sumber
                    <ExternalLink className="size-4" />
                  </Link>
                </Button>
              ) : null}
            </aside>
          </div>
        </div>
      </section>

      <div id="peta">
        <RecommendationRouteMap place={place} recommendations={recommendations} />
      </div>

      <section className="border-t-4 border-[#111111] bg-white py-14 sm:py-16">
        <div className="mx-auto flex w-full max-w-7xl justify-center px-4">
          <div className="inline-flex border-4 border-[#111111] bg-[#111111] px-6 py-5 shadow-[8px_8px_0_#ff5caf] sm:px-8 sm:py-6">
            <h2 className="text-2xl font-black uppercase leading-none text-white sm:text-4xl">
              <span className="bg-[#00e5ff] text-[#111111]">Rekomendasi</span> Serupa
            </h2>
          </div>
        </div>
      </section>

      <section className="bg-[#ffcc00] pb-16 pt-12 sm:pb-20 sm:pt-14">
        <div className="mx-auto w-full max-w-7xl px-4">
          {recommendations.length ? (
            <NeoBrutalPlaceGrid
              items={recommendations.map(toGridItem)}
            />
          ) : (
            <Card className="mt-8">
              <CardContent className="p-10 text-center">
                <h2 className="text-2xl font-black uppercase text-[#111111]">Belum ada rekomendasi</h2>
                <p className="mt-2 font-semibold text-[#3b3b3b]">Rekomendasi akan tampil setelah data serupa tersedia.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
}
