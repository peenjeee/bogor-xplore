"use client";

import { Map, MapClusteredPlaces } from "@/components/ui/map";
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
          <MapClusteredPlaces places={mapPlaces} />
        </Map>
      </div>
    </section>
  );
}
