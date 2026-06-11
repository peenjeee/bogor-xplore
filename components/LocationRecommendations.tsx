"use client";

import { Check, ChevronDown, Crosshair, Database, LocateFixed, MapPinned, Navigation, Route, Search } from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { FallbackImage } from "@/components/FallbackImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Map, MapMarker, MarkerContent, MarkerPopup } from "@/components/ui/map";
import { formatDistanceKm, getNearbyPlaces, type Coordinate, type NearbyPlace } from "@/lib/geo";
import { withPlaceCoordinates, type PlaceWithMapCoordinate } from "@/lib/place-coordinates";
import type { Place } from "@/lib/types";

type Mode = "selected-place" | "current-location";

type LocationState = {
  status: "idle" | "requesting" | "ready" | "denied" | "unavailable" | "error";
  coordinate?: Coordinate;
  message?: string;
};

const DESTINATION_ROW_HEIGHT = 44;
const DESTINATION_LIST_HEIGHT = 320;
const DESTINATION_LIST_OVERSCAN = 6;

function normalizeSearchText(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

function coordinateOf(place: PlaceWithMapCoordinate<Place>): Coordinate {
  return {
    latitude: place.latitude,
    longitude: place.longitude,
  };
}

function sourceLabel(source: NearbyPlace["coordinateSource"]) {
  return source === "database" ? "Koordinat database" : "Estimasi area";
}

function RecommendationMap({
  origin,
  originLabel,
  recommendations,
}: {
  origin: Coordinate;
  originLabel: string;
  recommendations: NearbyPlace[];
}) {
  const center: [number, number] = [origin.longitude, origin.latitude];
  const fitBounds = [
    center,
    ...recommendations.map((place) => [place.longitude, place.latitude] as [number, number]),
  ];

  return (
    <Map
      center={center}
      fitBounds={fitBounds}
      zoom={10.8}
      className="h-[62vh] min-h-[420px] rounded-none border-[4px] border-[#111111] shadow-[10px_10px_0_#111111]"
    >
      <MapMarker longitude={origin.longitude} latitude={origin.latitude}>
        <MarkerContent>
          <div className="grid size-9 place-items-center border-[3px] border-[#111111] bg-[#32ff7e] text-[#111111] shadow-[4px_4px_0_#ff5caf]">
            <Crosshair className="size-5 stroke-[3]" />
          </div>
        </MarkerContent>
        <MarkerPopup>
          <p className="text-sm font-black uppercase text-[#111111]">{originLabel}</p>
          <p className="mt-1 text-xs font-bold text-[#3b3b3b]">Titik awal rekomendasi</p>
        </MarkerPopup>
      </MapMarker>

      {recommendations.map((place, index) => (
        <MapMarker key={place.id} longitude={place.longitude} latitude={place.latitude}>
          <MarkerContent>
            <div className="grid size-8 rotate-45 place-items-center border-[3px] border-[#111111] bg-[#00e5ff] text-xs font-black text-[#111111] shadow-[4px_4px_0_#111111] transition-transform hover:scale-125">
              <span className="-rotate-45">{index + 1}</span>
            </div>
          </MarkerContent>
          <MarkerPopup className="space-y-3">
            <div>
              <p className="text-sm font-black uppercase text-[#111111]">{place.nama}</p>
              <p className="mt-1 text-xs font-bold text-[#3b3b3b]">
                {formatDistanceKm(place.distanceKm)} dari titik awal
              </p>
            </div>
            <Link
              href={`/places/${place.id}`}
              className="inline-flex w-full items-center justify-center gap-2 border-[3px] border-[#111111] bg-[#ffcc00] px-3 py-2 text-xs font-black uppercase shadow-[4px_4px_0_#111111] hover:bg-[#111111] hover:!text-white"
            >
              Detail
              <Navigation className="size-3.5" />
            </Link>
          </MarkerPopup>
        </MapMarker>
      ))}
    </Map>
  );
}

function RecommendationCard({ place, index }: { place: NearbyPlace; index: number }) {
  return (
    <Link
      href={`/places/${place.id}`}
      className="group grid h-full border-4 border-[#111111] bg-white p-4 text-[#111111] shadow-[8px_8px_0_#111111] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0_#111111]"
    >
      <div className="flex items-start justify-between gap-3">
        <Badge className="bg-[#ffcc00] text-[#111111]">#{index + 1}</Badge>
        <Badge variant={place.coordinateSource === "database" ? "secondary" : "outline"} className="gap-1">
          <Database className="size-3" />
          {sourceLabel(place.coordinateSource)}
        </Badge>
      </div>

      <div className="relative mt-4 aspect-[4/3] overflow-hidden border-[3px] border-[#111111] bg-[#ffcc00]">
        <FallbackImage
          src={place.url_gambar}
          alt={place.nama}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <h3 className="mt-4 text-xl font-black uppercase leading-tight text-[#111111]">{place.nama}</h3>
      <p className="mt-2 text-sm font-bold leading-6 text-[#3b3b3b]">
        {place.alamat ?? place.kategori ?? "Bogor, Jawa Barat"}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3 border-t-[3px] border-[#111111] pt-4">
        <span className="inline-flex items-center gap-2 text-sm font-black uppercase">
          <Route className="size-4" />
          {formatDistanceKm(place.distanceKm)}
        </span>
        <span className="text-xs font-black uppercase group-hover:border-b-2 group-hover:border-[#111111]">
          Detail
        </span>
      </div>
    </Link>
  );
}

function DestinationPicker({
  places,
  value,
  onValueChange,
}: {
  places: Array<PlaceWithMapCoordinate<Place>>;
  value: string;
  onValueChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const selectedPlace = places.find((place) => String(place.id) === value);
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = normalizeSearchText(deferredQuery.trim());
  const filteredPlaces = useMemo(() => {
    return normalizedQuery
      ? places.filter((place) =>
          normalizeSearchText(`${place.nama} ${place.kategori ?? ""}`).includes(normalizedQuery),
        )
      : places;
  }, [normalizedQuery, places]);
  const virtualStartIndex = Math.max(
    0,
    Math.floor(scrollTop / DESTINATION_ROW_HEIGHT) - DESTINATION_LIST_OVERSCAN,
  );
  const virtualItemCount =
    Math.ceil(DESTINATION_LIST_HEIGHT / DESTINATION_ROW_HEIGHT) + DESTINATION_LIST_OVERSCAN * 2;
  const virtualEndIndex = Math.min(filteredPlaces.length, virtualStartIndex + virtualItemCount);
  const visiblePlaces = filteredPlaces.slice(virtualStartIndex, virtualEndIndex);
  const totalListHeight = filteredPlaces.length * DESTINATION_ROW_HEIGHT;
  const renderedListHeight = Math.min(DESTINATION_LIST_HEIGHT, Math.max(totalListHeight, DESTINATION_ROW_HEIGHT));

  useEffect(() => {
    if (!open) return;

    const timeout = window.setTimeout(() => inputRef.current?.focus(), 0);
    const handlePointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      window.clearTimeout(timeout);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative mt-2">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex min-h-12 w-full items-center justify-between gap-3 border-[3px] border-[#111111] bg-white px-3 text-left text-sm font-black uppercase text-[#111111] shadow-[4px_4px_0_#111111] outline-none transition-all focus:ring-4 focus:ring-[#ff5caf]"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="min-w-0 truncate">{selectedPlace?.nama ?? "Pilih destinasi"}</span>
        <ChevronDown className="size-4 shrink-0 opacity-70" />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 border-[3px] border-[#111111] bg-white shadow-[6px_6px_0_#111111]">
          <label className="flex min-h-12 items-center gap-2 border-b-[3px] border-[#111111] bg-[#ffcc00] px-3">
            <Search className="size-4 shrink-0 text-[#111111]" />
            <span className="sr-only">Cari destinasi</span>
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setScrollTop(0);
                if (listRef.current) {
                  listRef.current.scrollTop = 0;
                }
              }}
              placeholder="Cari destinasi..."
              className="min-w-0 flex-1 bg-transparent text-sm font-black uppercase text-[#111111] outline-none placeholder:text-[#3b3b3b]"
            />
          </label>

          <div
            ref={listRef}
            className="overflow-y-auto p-1"
            style={{ height: renderedListHeight }}
            onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
          >
            {visiblePlaces.length ? (
              <div className="relative" style={{ height: totalListHeight }}>
                {visiblePlaces.map((place, index) => {
                const itemValue = String(place.id);
                const selected = itemValue === value;
                const virtualIndex = virtualStartIndex + index;

                return (
                  <button
                    key={place.id}
                    type="button"
                    aria-pressed={selected}
                    className="absolute left-0 right-0 flex items-center gap-2 border-2 border-transparent px-2 text-left text-sm font-black uppercase text-[#111111] outline-none hover:border-[#111111] hover:bg-[#00e5ff] focus:border-[#111111] focus:bg-[#00e5ff]"
                    style={{
                      height: DESTINATION_ROW_HEIGHT,
                      top: virtualIndex * DESTINATION_ROW_HEIGHT,
                    }}
                    onClick={() => {
                      onValueChange(itemValue);
                      setQuery("");
                      setScrollTop(0);
                      setOpen(false);
                    }}
                  >
                    <Check className={["size-4 shrink-0", selected ? "opacity-100" : "opacity-0"].join(" ")} />
                    <span className="min-w-0 truncate">{place.nama}</span>
                  </button>
                );
                })}
              </div>
            ) : (
              <p className="px-3 py-6 text-center text-sm font-black uppercase text-[#3b3b3b]">
                Tidak ada destinasi
              </p>
            )}
          </div>

          <p className="border-t-[3px] border-[#111111] bg-[#f7f7ef] px-3 py-2 text-xs font-black uppercase text-[#3b3b3b]">
            {filteredPlaces.length.toLocaleString("id-ID")} destinasi tersedia.
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function LocationRecommendations({
  places,
  initialPlaceId,
}: {
  places: Place[];
  initialPlaceId?: number;
}) {
  const coordinatePlaces = useMemo(() => withPlaceCoordinates(places), [places]);
  const fallbackPlaceId = coordinatePlaces[0]?.id ?? 0;
  const [mode, setMode] = useState<Mode>("selected-place");
  const [selectedPlaceId, setSelectedPlaceId] = useState(String(initialPlaceId ?? fallbackPlaceId));
  const [locationState, setLocationState] = useState<LocationState>({ status: "idle" });
  const selectedPlace =
    coordinatePlaces.find((place) => String(place.id) === selectedPlaceId) ?? coordinatePlaces[0];

  const selectedRecommendations = useMemo(() => {
    if (!selectedPlace) return [];

    return getNearbyPlaces({
      origin: coordinateOf(selectedPlace),
      places,
      excludePlaceId: selectedPlace.id,
      limit: 9,
    });
  }, [places, selectedPlace]);

  const currentLocationRecommendations = useMemo(() => {
    if (!locationState.coordinate) return [];

    return getNearbyPlaces({
      origin: locationState.coordinate,
      places,
      limit: 9,
    });
  }, [locationState.coordinate, places]);

  const hasCurrentLocation = mode === "current-location" && locationState.status === "ready" && locationState.coordinate;
  const activeOrigin = hasCurrentLocation
    ? locationState.coordinate
    : selectedPlace
      ? coordinateOf(selectedPlace)
      : undefined;
  const activeOriginLabel = hasCurrentLocation ? "Lokasi saya" : selectedPlace?.nama ?? "Destinasi terpilih";
  const activeRecommendations = hasCurrentLocation ? currentLocationRecommendations : selectedRecommendations;

  function requestCurrentLocation() {
    setMode("current-location");

    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setLocationState({
        status: "unavailable",
        message: "Browser ini belum mendukung akses lokasi.",
      });
      return;
    }

    setLocationState({
      status: "requesting",
      message: "Meminta akses lokasi...",
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationState({
          status: "ready",
          coordinate: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          message: "Lokasi aktif.",
        });
      },
      (error) => {
        setLocationState({
          status: error.code === error.PERMISSION_DENIED ? "denied" : "error",
          message:
            error.code === error.PERMISSION_DENIED
              ? "Akses lokasi ditolak."
              : "Lokasi belum bisa dibaca. Coba ulangi dari browser.",
        });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60000,
        timeout: 12000,
      },
    );
  }

  return (
    <section className="bg-[#f7f7ef] py-12 sm:py-16">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 lg:grid-cols-[400px_minmax(0,1fr)]">
        <aside className="grid gap-5 lg:sticky lg:top-28 lg:self-start">
          <div className="border-4 border-[#111111] bg-white p-5 shadow-[8px_8px_0_#111111]">
            <h2 className="text-3xl font-black uppercase leading-none text-[#111111]">
              Titik Awal Rekomendasi
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <Button
                type="button"
                variant={mode === "selected-place" ? "secondary" : "outline"}
                className="justify-start"
                onClick={() => setMode("selected-place")}
              >
                <MapPinned className="size-4" />
                Wisata Dipilih
              </Button>
              <Button
                type="button"
                variant={mode === "current-location" ? "secondary" : "outline"}
                className="justify-start"
                onClick={requestCurrentLocation}
                disabled={locationState.status === "requesting"}
              >
                <LocateFixed className="size-4" />
                Lokasi Saya
              </Button>
            </div>

            <div className="mt-5 block">
              <span className="text-xs font-black uppercase text-[#3b3b3b]">Destinasi</span>
              <DestinationPicker
                places={coordinatePlaces}
                value={selectedPlaceId}
                onValueChange={(value) => {
                  setSelectedPlaceId(value);
                  setMode("selected-place");
                }}
              />
            </div>

            {locationState.message ? (
              <p className="mt-4 border-[3px] border-[#111111] bg-[#ffcc00] px-3 py-2 text-sm font-black text-[#111111]" aria-live="polite">
                {locationState.message}
              </p>
            ) : null}
          </div>
        </aside>

        <div className="min-w-0">
          {activeOrigin ? (
            <RecommendationMap
              origin={activeOrigin}
              originLabel={activeOriginLabel}
              recommendations={activeRecommendations.slice(0, 6)}
            />
          ) : (
            <div className="grid min-h-[420px] place-items-center border-4 border-[#111111] bg-white p-8 text-center shadow-[10px_10px_0_#111111]">
              <p className="text-xl font-black uppercase text-[#111111]">Lokasi belum tersedia</p>
            </div>
          )}

          <div className="mt-10 border-4 border-[#111111] bg-[#ffcc00] p-5 shadow-[8px_8px_0_#111111] sm:p-7">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="inline-flex border-[3px] border-[#111111] bg-white px-3 py-1 text-xs font-black uppercase shadow-[3px_3px_0_#111111]">
                  {activeOriginLabel}
                </span>
                <h2 className="mt-3 text-3xl font-black uppercase leading-none text-[#111111] sm:text-5xl">
                  Rekomendasi Terdekat
                </h2>
              </div>
              <Badge className="bg-[#00e5ff] text-[#111111]">
                {activeRecommendations.length} lokasi
              </Badge>
            </div>
          </div>

          {activeRecommendations.length ? (
            <div className="mt-8 grid grid-cols-1 gap-6 pr-4 md:grid-cols-2 xl:grid-cols-3">
              {activeRecommendations.map((place, index) => (
                <RecommendationCard key={place.id} place={place} index={index} />
              ))}
            </div>
          ) : (
            <div className="mt-8 border-4 border-[#111111] bg-white p-8 text-center shadow-[8px_8px_0_#111111]">
              <h3 className="text-2xl font-black uppercase text-[#111111]">Belum ada rekomendasi</h3>
              <p className="mt-2 font-bold text-[#3b3b3b]">
                Pilih destinasi lain atau aktifkan lokasi saya untuk menghitung rekomendasi terdekat.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
