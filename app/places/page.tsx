import type { Metadata } from "next";
import { Filter, Search } from "lucide-react";
import { CategorySelect } from "@/components/CategorySelect";
import { NeoBrutalPlaceGrid, type NeoBrutalGridItem } from "@/components/NeoBrutalPlaceGrid";
import { Pagination } from "@/components/Pagination";
import { PlaceMapLazy } from "@/components/PlaceMapLazy";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getCategories, getPlaces, getPlacesForMap } from "@/lib/places";
import type { Place, SearchParams } from "@/lib/types";

export const metadata: Metadata = {
  title: "Daftar Wisata",
  description:
    "Cari dan filter 297 destinasi wisata Bogor berdasarkan kategori, nama destinasi, dan deskripsi.",
};

export const dynamic = "force-dynamic";

function valueOf(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

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

export default async function PlacesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = ((await searchParams) ?? {}) as SearchParams;
  const search = valueOf(params.search);
  const category = valueOf(params.category);
  const page = valueOf(params.page);

  const [categories, result, mapPlaces] = await Promise.all([
    getCategories(),
    getPlaces({ search, category, page }),
    getPlacesForMap({ search, category }),
  ]);
  const resultSummary = `Halaman ${result.page} dari ${result.totalPages}${
    category ? ` untuk kategori ${category}` : ""
  }${search ? ` dengan kata kunci "${search}"` : ""}.`;
  const gridItems = result.places.map(toGridItem);

  return (
    <main>
      <section className="relative overflow-hidden border-b-4 border-[#111111] bg-[#ffcc00] pb-14 pt-32 text-[#111111] sm:pb-16 sm:pt-36">
        <div className="relative z-10 mx-auto w-full max-w-6xl px-4">
          <h1 className="mt-6 max-w-4xl text-5xl font-black uppercase leading-none sm:text-6xl">
            Cari{" "}
            <span className="inline-block bg-[#00e5ff] px-2 py-1 sm:px-3">
              rekomendasi
            </span>{" "}
            terbaik untuk rencana berikutnya
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-bold leading-8 text-[#111111]">
            Dari curug, bukit, kuliner, sampai tempat keluarga, temukan tempat terbaik untuk kamu.
          </p>
        </div>
      </section>

      <section className="bg-transparent py-12 sm:py-16">
        <div className="mx-auto w-full max-w-6xl px-4">
          <form
            className="relative -mt-20 grid gap-3 border-4 border-[#111111] bg-[#32ff7e] p-3 shadow-[10px_10px_0_#111111] lg:grid-cols-[1fr_240px_auto]"
            action="/places"
          >
            <label
              htmlFor="places-search"
              className="flex min-h-12 items-center gap-3 border-[3px] border-[#111111] bg-white px-4 shadow-[4px_4px_0_#111111] focus-within:ring-4 focus-within:ring-[#ff5caf]"
            >
              <Search aria-hidden="true" className="size-5 shrink-0 text-[#111111]" />
              <span className="sr-only">Cari destinasi</span>
              <Input
                id="places-search"
                aria-label="Cari destinasi"
                className="h-auto border-0 bg-transparent p-0 text-base font-black shadow-none ring-0 focus-visible:translate-x-0 focus-visible:translate-y-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-none"
                type="search"
                name="search"
                placeholder="Cari destinasi, curug, kuliner, camping..."
                defaultValue={search ?? ""}
              />
            </label>

            <CategorySelect categories={categories} defaultValue={category} />

            <Button className="min-h-12 !bg-[#00e5ff] !font-black !text-[#111111] hover:!bg-[#111111] hover:!text-white" type="submit">
              <Filter className="size-4" />
              <span className="font-black">Terapkan</span>
            </Button>
          </form>

          {result.places.length ? (
            <>
              <NeoBrutalPlaceGrid
                className="mt-10"
                title={`${result.count.toLocaleString("id-ID")} destinasi ditemukan`}
                description={resultSummary}
                items={gridItems}
              />
              <Pagination
                page={result.page}
                totalPages={result.totalPages}
                search={search}
                category={category}
              />
            </>
          ) : (
            <Card className="mt-8">
              <CardContent className="p-10 text-center">
                <Badge variant="secondary">Tidak ada hasil</Badge>
                <h2 className="mt-4 text-2xl font-black uppercase text-[#111111]">Tidak ada destinasi yang cocok</h2>
                <p className="mt-2 font-semibold text-[#3b3b3b]">Coba pakai kata kunci lain atau kosongkan filter kategori.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <div id="peta">
        <PlaceMapLazy
          places={mapPlaces}
          title={search || category ? "Peta hasil pencarian" : "Peta semua destinasi"}
          description="Titik di peta mengikuti semua destinasi yang cocok dengan pencarian dan filter, bukan hanya kartu di halaman ini."
        />
      </div>
    </main>
  );
}
