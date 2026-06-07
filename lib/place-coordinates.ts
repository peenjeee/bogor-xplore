import type { Place } from "@/lib/types";

type CoordinatePlaceInput = Pick<Place, "id" | "nama"> & Partial<Place>;

export type PlaceWithMapCoordinate<T extends CoordinatePlaceInput = CoordinatePlaceInput> = T & {
  latitude: number;
  longitude: number;
  coordinateSource: "database" | "estimated";
};

type Anchor = {
  pattern: RegExp;
  center: [number, number];
  spread: number;
};

const BOGOR_CENTER: [number, number] = [106.806, -6.596];

const AREA_ANCHORS: Anchor[] = [
  { pattern: /sentul|babakan madang|bojong koneng|gunung pancar/i, center: [106.881, -6.565], spread: 0.045 },
  { pattern: /ciawi|gadog|megamen?dung|cilember|cibedug/i, center: [106.869, -6.665], spread: 0.04 },
  { pattern: /cisarua|puncak|tugu|cibeureum|cibodas/i, center: [106.945, -6.704], spread: 0.05 },
  { pattern: /dramaga|ipb|situ burung|cifor/i, center: [106.733, -6.575], spread: 0.035 },
  { pattern: /cibinong|citeureup|bojonggede|tajur halang/i, center: [106.829, -6.485], spread: 0.04 },
  { pattern: /parung|ciseeng|gunung sindur|rumpin|kemang/i, center: [106.682, -6.421], spread: 0.055 },
  { pattern: /ciampea|cibungbulang|pamijahan|gunung salak|halimun/i, center: [106.694, -6.673], spread: 0.055 },
  { pattern: /leuwiliang|leuwisadeng|nanggung|jasinga|tenjo/i, center: [106.562, -6.586], spread: 0.065 },
  { pattern: /ciomas|tamansari|cijeruk|cigombong|caringin/i, center: [106.759, -6.687], spread: 0.045 },
  { pattern: /jonggol|cileungsi|gunung putri|klapanunggal/i, center: [106.997, -6.451], spread: 0.06 },
  { pattern: /sukamakmur|curug ciherang|villa khayangan/i, center: [107.047, -6.642], spread: 0.05 },
  { pattern: /cariu|tanjungsari/i, center: [107.157, -6.553], spread: 0.065 },
  { pattern: /kebun raya|suryakencana|botani|pajajaran|bogor kota|kota bogor/i, center: BOGOR_CENTER, spread: 0.03 },
  { pattern: /kuliner|belanja|cafe|coffee|resto|restaurant|bakery|mall/i, center: [106.807, -6.589], spread: 0.04 },
  { pattern: /curug|air terjun|leuwi/i, center: [106.731, -6.704], spread: 0.06 },
];

function isFiniteCoordinate(value: number | string | null | undefined) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return Number.isFinite(Number(value));
}

function hashText(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function offsetFromHash(seed: number, spread: number) {
  const lngUnit = ((seed % 2000) / 1999 - 0.5) * 2;
  const latUnit = (((Math.floor(seed / 2000) % 2000) / 1999) - 0.5) * 2;

  return {
    longitudeOffset: lngUnit * spread,
    latitudeOffset: latUnit * spread,
  };
}

function chooseAnchor(place: CoordinatePlaceInput): Anchor {
  const haystack = [
    place.nama,
    place.kategori,
    place.label,
    place.alamat,
    place.tags,
    place.deskripsi,
  ]
    .filter(Boolean)
    .join(" ");

  return AREA_ANCHORS.find((anchor) => anchor.pattern.test(haystack)) ?? {
    pattern: /bogor/i,
    center: BOGOR_CENTER,
    spread: 0.08,
  };
}

export function withPlaceCoordinate<T extends CoordinatePlaceInput>(place: T): PlaceWithMapCoordinate<T> {
  const latitude = Number(place.latitude);
  const longitude = Number(place.longitude);

  if (isFiniteCoordinate(place.latitude) && isFiniteCoordinate(place.longitude) && !(latitude === 0 && longitude === 0)) {
    return {
      ...place,
      latitude,
      longitude,
      coordinateSource: "database",
    };
  }

  const anchor = chooseAnchor(place);
  const seed = hashText(`${place.id}-${place.nama}`);
  const { latitudeOffset, longitudeOffset } = offsetFromHash(seed, anchor.spread);

  return {
    ...place,
    latitude: anchor.center[1] + latitudeOffset,
    longitude: anchor.center[0] + longitudeOffset,
    coordinateSource: "estimated",
  };
}

export function withPlaceCoordinates<T extends CoordinatePlaceInput>(places: T[]) {
  return places.map(withPlaceCoordinate);
}
