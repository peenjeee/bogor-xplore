"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import maplibregl from "maplibre-gl";
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerTooltip,
  MapRoute,
  useMap,
} from "@/components/ui/mapcn-map-route";
import { withPlaceCoordinates } from "@/lib/place-coordinates";
import type { Place } from "@/lib/types";

type RoutePlace = Pick<
  Place,
  "id" | "nama" | "kategori" | "latitude" | "longitude" | "alamat" | "likes" | "deskripsi" | "label" | "tags"
>;

type RouteData = {
  coordinates: [number, number][];
  duration: number;
  distance: number;
  source: "osrm" | "segmented" | "fallback";
};

type OsrmRoute = {
  geometry?: {
    coordinates?: number[][];
  };
  duration?: number;
  distance?: number;
};

const OSRM_ROUTE_ENDPOINT = "https://router.project-osrm.org/route/v1/driving";

function normalizeRouteCoordinates(coordinates: number[][] | undefined) {
  if (!Array.isArray(coordinates)) return [];

  const normalizedCoordinates: [number, number][] = [];

  for (const coordinate of coordinates) {
    const longitude = Number(coordinate[0]);
    const latitude = Number(coordinate[1]);
    if (Number.isFinite(longitude) && Number.isFinite(latitude)) {
      normalizedCoordinates.push([longitude, latitude]);
    }
  }

  return normalizedCoordinates;
}

function haversineDistance(start: [number, number], end: [number, number]) {
  const earthRadius = 6371000;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const startLat = toRadians(start[1]);
  const endLat = toRadians(end[1]);
  const deltaLat = toRadians(end[1] - start[1]);
  const deltaLng = toRadians(end[0] - start[0]);
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getFallbackRoute(coordinates: [number, number][]): RouteData {
  return {
    coordinates,
    duration: 0,
    distance: coordinates.reduce((total, coordinate, index) => {
      if (index === 0) return total;
      return total + haversineDistance(coordinates[index - 1], coordinate);
    }, 0),
    source: "fallback",
  };
}

async function requestOsrmRoutes(coordinates: [number, number][], alternatives: boolean) {
  const routeParam = coordinates.map(([longitude, latitude]) => `${longitude},${latitude}`).join(";");
  const alternativeParam = alternatives ? "&alternatives=true" : "";
  const response = await fetch(
    `${OSRM_ROUTE_ENDPOINT}/${routeParam}?overview=full&geometries=geojson&steps=false${alternativeParam}`,
  );

  if (!response.ok) throw new Error("OSRM request failed");

  const payload = (await response.json()) as { routes?: OsrmRoute[] };
  const routes: RouteData[] = [];
  for (const route of payload.routes ?? []) {
    const routeData = {
      coordinates: normalizeRouteCoordinates(route.geometry?.coordinates),
      duration: Number(route.duration ?? 0),
      distance: Number(route.distance ?? 0),
      source: "osrm" as const,
    };
    if (routeData.coordinates.length >= 2) routes.push(routeData);
  }
  return routes;
}

function appendRouteSegment(target: [number, number][], segment: [number, number][]) {
  if (!segment.length) return;
  const lastCoordinate = target[target.length - 1];
  const firstSegmentCoordinate = segment[0];

  if (
    lastCoordinate &&
    firstSegmentCoordinate &&
    lastCoordinate[0] === firstSegmentCoordinate[0] &&
    lastCoordinate[1] === firstSegmentCoordinate[1]
  ) {
    target.push(...segment.slice(1));
    return;
  }

  target.push(...segment);
}

async function requestSegmentedOsrmRoute(coordinates: [number, number][]) {
  const segments = await Promise.all(
    coordinates.slice(0, -1).map(async (coordinate, index) => {
      try {
        return (await requestOsrmRoutes([coordinate, coordinates[index + 1]], false))[0] ?? null;
      } catch {
        return null;
      }
    }),
  );

  if (!segments.some(Boolean)) return null;

  return segments.reduce<RouteData>(
    (combinedRoute, segment, index) => {
      if (segment) {
        appendRouteSegment(combinedRoute.coordinates, segment.coordinates);
        combinedRoute.duration += segment.duration;
        combinedRoute.distance += segment.distance;
        return combinedRoute;
      }

      const fallbackSegment = [coordinates[index], coordinates[index + 1]] as [number, number][];
      appendRouteSegment(combinedRoute.coordinates, fallbackSegment);
      combinedRoute.distance += haversineDistance(coordinates[index], coordinates[index + 1]);
      combinedRoute.source = "fallback";
      return combinedRoute;
    },
    {
      coordinates: [],
      duration: 0,
      distance: 0,
      source: "segmented",
    },
  );
}

async function requestRoadRoutes(coordinates: [number, number][]) {
  try {
    const fullRoutes = await requestOsrmRoutes(coordinates, coordinates.length === 2);
    if (fullRoutes.length) return fullRoutes;
  } catch {
    // Fall back to per-segment routing below so one difficult waypoint does not flatten the route.
  }

  const segmentedRoute = await requestSegmentedOsrmRoute(coordinates);
  return segmentedRoute ? [segmentedRoute] : [getFallbackRoute(coordinates)];
}

function getRouteKey(route: RouteData) {
  const firstCoordinate = route.coordinates[0]?.join(",");
  const lastCoordinate = route.coordinates.at(-1)?.join(",");
  return [
    route.source,
    route.coordinates.length,
    Math.round(route.distance),
    Math.round(route.duration),
    firstCoordinate,
    lastCoordinate,
  ].join("-");
}

function getRouteBounds(coordinates: [number, number][]) {
  return coordinates.reduce<maplibregl.LngLatBounds | null>((currentBounds, coordinate) => {
    if (!currentBounds) return new maplibregl.LngLatBounds(coordinate, coordinate);
    return currentBounds.extend(coordinate);
  }, null);
}

function syncRouteBounds(map: maplibregl.Map, coordinates: [number, number][]) {
  if (coordinates.length === 1) {
    map.easeTo({ center: coordinates[0], zoom: 11.5, duration: 0 });
    return;
  }

  const bounds = getRouteBounds(coordinates);
  if (!bounds) return;

  map.fitBounds(bounds, {
    duration: 0,
    maxZoom: 12,
    padding: { top: 70, right: 70, bottom: 70, left: 70 },
  });
}

function RouteBounds({ coordinates }: { coordinates: [number, number][] }) {
  const { map, isLoaded } = useMap();
  const coordinateKey = coordinates.map((coordinate) => coordinate.join(",")).join("|");

  useEffect(() => {
    if (!isLoaded || !map || coordinates.length === 0) return;

    syncRouteBounds(map, coordinates);
  }, [coordinateKey, coordinates, isLoaded, map]);

  return null;
}

export function RecommendationRouteMap({
  place,
  recommendations,
}: {
  place: RoutePlace;
  recommendations: RoutePlace[];
}) {
  const routePlaces = useMemo(
    () => withPlaceCoordinates([place, ...recommendations]).slice(0, 7),
    [place, recommendations],
  );
  const coordinates = useMemo(
    () => routePlaces.map((item) => [item.longitude, item.latitude] as [number, number]),
    [routePlaces],
  );
  const coordinateKey = useMemo(() => coordinates.map((coordinate) => coordinate.join(",")).join("|"), [coordinates]);
  const center = coordinates.length
    ? ([
        coordinates.reduce((total, coordinate) => total + coordinate[0], 0) / coordinates.length,
        coordinates.reduce((total, coordinate) => total + coordinate[1], 0) / coordinates.length,
      ] as [number, number])
    : ([106.806, -6.596] as [number, number]);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const activeRouteCoordinates = routes[selectedIndex]?.coordinates ?? coordinates;
  const sortedRoutes = routes
    .map((route, index) => ({ route, index, routeKey: getRouteKey(route) }))
    .sort((a, b) => {
      if (a.index === selectedIndex) return 1;
      if (b.index === selectedIndex) return -1;
      return 0;
    });

  useEffect(() => {
    let isCancelled = false;

    if (coordinates.length < 2) return;

    async function fetchRoadRoute() {
      setSelectedIndex(0);
      setRoutes([]);

      try {
        const roadRoutes = await requestRoadRoutes(coordinates);
        if (!isCancelled) setRoutes(roadRoutes);
      } catch {
        if (!isCancelled) setRoutes([getFallbackRoute(coordinates)]);
      }
    }

    fetchRoadRoute();

    return () => {
      isCancelled = true;
    };
  }, [coordinateKey, coordinates]);

  return (
    <section className="border-y-4 border-[#111111] bg-[#B4FA28] py-16 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="mb-8 border-[4px] border-[#111111] bg-white px-5 py-4 shadow-[8px_8px_0_#111111] sm:px-7 sm:py-5">
          <h2 className="text-3xl font-black uppercase leading-none text-[#111111] sm:text-5xl">
            Route Peta Rekomendasi
          </h2>
        </div>

        <div className="relative h-[72vh] min-h-[540px] overflow-hidden border-[4px] border-[#111111] bg-[#f7f7ef] shadow-[12px_12px_0_#111111]">
          <Map center={center} zoom={10.5} theme="light" className="h-full w-full">
            <RouteBounds coordinates={activeRouteCoordinates.length ? activeRouteCoordinates : coordinates} />
            {sortedRoutes.length ? (
              sortedRoutes.map(({ route, index, routeKey }) => {
                const isSelected = index === selectedIndex;
                return isSelected ? (
                  <Fragment key={`route-${routeKey}`}>
                    <MapRoute id={`recommendation-route-shadow-${index}`} coordinates={route.coordinates} color="#111111" width={10} opacity={0.9} />
                    <MapRoute
                      id={`recommendation-route-main-${index}`}
                      coordinates={route.coordinates}
                      color="#6c63ff"
                      width={5}
                      opacity={1}
                      onClick={() => setSelectedIndex(index)}
                    />
                  </Fragment>
                ) : (
                  <MapRoute
                    key={`route-${routeKey}`}
                    id={`recommendation-route-alt-${index}`}
                    coordinates={route.coordinates}
                    color="#7c8794"
                    width={5}
                    opacity={0.55}
                    onClick={() => setSelectedIndex(index)}
                  />
                );
              })
            ) : null}

            {routePlaces.map((item, index) => (
              <MapMarker key={item.id} longitude={item.longitude} latitude={item.latitude}>
                <MarkerContent>
                  <div
                    className={[
                      "flex size-7 rotate-45 items-center justify-center border-[3px] border-[#111111] text-[11px] font-black text-[#111111] shadow-[4px_4px_0_#ff5caf] transition-transform hover:scale-125",
                      index === 0 ? "bg-[#32ff7e]" : "bg-[#00e5ff]",
                    ].join(" ")}
                  >
                    <span className="-rotate-45">{index + 1}</span>
                  </div>
                </MarkerContent>
                <MarkerTooltip className="rounded-none border-[3px] border-[#111111] bg-white px-3 py-2 text-xs font-black uppercase text-[#111111] shadow-[4px_4px_0_#111111]">
                  {index === 0 ? "Destinasi dipilih" : item.nama}
                </MarkerTooltip>
              </MapMarker>
            ))}
          </Map>
        </div>
      </div>
    </section>
  );
}
