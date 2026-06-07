"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { Map, MapMarker, MarkerContent, MarkerPopup } from "@/components/ui/map";
import { withPlaceCoordinates } from "@/lib/place-coordinates";
import type { Place } from "@/lib/types";

type MapPlace = Pick<Place, "id" | "nama" | "kategori" | "latitude" | "longitude" | "alamat" | "likes" | "deskripsi" | "label" | "tags">;

export function PlaceMap({
  places,
}: {
  places: MapPlace[];
  title?: string;
  description?: string;
}) {
  const mapPlaces = withPlaceCoordinates(places);
  const center: [number, number] =
    mapPlaces.length > 0 ? [mapPlaces[0].longitude, mapPlaces[0].latitude] : [106.806, -6.596];
  const mapBounds = mapPlaces.map((place) => [place.longitude, place.latitude] as [number, number]);

  return (
    <section className="border-y-4 border-[#111111] bg-[#B4FA28] py-16 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="mb-8 border-[4px] border-[#111111] bg-white px-5 py-4 shadow-[8px_8px_0_#111111] sm:px-7 sm:py-5">
          <h2 className="text-3xl font-black uppercase leading-none text-[#111111] sm:text-5xl">
            Peta Semua Destinasi
          </h2>
        </div>
        <Map
          center={center}
          fitBounds={mapBounds}
          zoom={10.5}
          className="h-[72vh] min-h-[540px] rounded-none border-[4px] border-[#111111] bg-[#f7f7ef] shadow-[12px_12px_0_#111111]"
        >
          {mapPlaces.map((place) => (
            <MapMarker
              key={place.id}
              longitude={place.longitude}
              latitude={place.latitude}
            >
              <MarkerContent className="group">
                <div
                  className="relative size-5 rotate-45 border-[3px] border-[#111111] bg-[#00e5ff] shadow-[4px_4px_0_#ff5caf] transition-transform group-hover:scale-125"
                  title={place.nama}
                >
                  <span className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#111111]" />
                </div>
              </MarkerContent>
              <MarkerPopup className="space-y-3">
                <div>
                  <p className="text-sm font-black uppercase text-[#111111]">{place.nama}</p>
                  <p className="mt-1 text-xs font-semibold text-[#3b3b3b]">
                    {place.alamat ?? place.kategori ?? "Bogor, Jawa Barat"}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 text-xs font-semibold">
                  <span className="inline-flex items-center gap-1 text-[#111111]">
                    <Heart className="size-3.5" />
                    {Number(place.likes ?? 0).toLocaleString("id-ID")}
                  </span>
                </div>
                <Link
                  href={`/places/${place.id}`}
                  className="bogor-map-detail-link inline-flex w-full items-center justify-center border-[3px] border-[#111111] bg-[#ffcc00] px-3 py-2 text-xs font-black uppercase shadow-[4px_4px_0_#111111] transition-colors hover:bg-[#111111]"
                >
                  Lihat detail
                </Link>
              </MarkerPopup>
            </MapMarker>
          ))}
        </Map>
      </div>
    </section>
  );
}
