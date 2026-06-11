import { withPlaceCoordinates, type PlaceWithMapCoordinate } from "@/lib/place-coordinates";
import type { Place } from "@/lib/types";

export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type NearbyPlace = PlaceWithMapCoordinate<Place> & {
  distanceKm: number;
};

const EARTH_RADIUS_KM = 6371.0088;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function haversineDistanceKm(start: Coordinate, end: Coordinate) {
  const startLat = toRadians(start.latitude);
  const endLat = toRadians(end.latitude);
  const deltaLat = toRadians(end.latitude - start.latitude);
  const deltaLng = toRadians(end.longitude - start.longitude);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(deltaLng / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getNearbyPlaces({
  origin,
  places,
  excludePlaceId,
  limit = 9,
}: {
  origin: Coordinate;
  places: Place[];
  excludePlaceId?: number;
  limit?: number;
}) {
  const nearbyPlaces: NearbyPlace[] = [];

  for (const place of withPlaceCoordinates(places)) {
    if (place.id === excludePlaceId) continue;

    nearbyPlaces.push({
      ...place,
      distanceKm: haversineDistanceKm(origin, place),
    });
  }

  nearbyPlaces.sort((a, b) => {
    if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
    return Number(b.likes ?? 0) - Number(a.likes ?? 0);
  });

  return nearbyPlaces.slice(0, limit);
}

export function formatDistanceKm(distanceKm: number) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000).toLocaleString("id-ID")} m`;
  }

  return `${distanceKm.toLocaleString("id-ID", {
    maximumFractionDigits: distanceKm < 10 ? 1 : 0,
  })} km`;
}
