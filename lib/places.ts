import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Place, PlaceListResult } from "@/lib/types";

export const PAGE_SIZE = 18;

const flaskBaseUrl = process.env.NEXT_PUBLIC_FLASK_API_URL?.replace(/\/$/, "");

type FlaskSearchResult = {
  nama?: string;
};

function normalizePage(value?: string) {
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function cleanFilterValue(value?: string) {
  return (value ?? "").trim();
}

function escapePostgrestPattern(value: string) {
  return value.replace(/[%(),]/g, " ").trim();
}

function emptyPlaceList(page = 1): PlaceListResult {
  return { places: [], count: 0, page, pageSize: PAGE_SIZE, totalPages: 1 };
}

function paginatePlaces(places: Place[], page: number): PlaceListResult {
  const offset = (page - 1) * PAGE_SIZE;
  const total = places.length;

  return {
    places: places.slice(offset, offset + PAGE_SIZE),
    count: total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

async function getSemanticPlaces(search: string, category: string) {
  if (!flaskBaseUrl) return null;

  try {
    const params = new URLSearchParams({
      q: search,
      limit: "100",
    });
    const response = await fetch(`${flaskBaseUrl}/api/search?${params.toString()}`, {
      cache: "no-store",
    });

    if (!response.ok) return null;

    const payload = await response.json();
    const rawResults = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.data?.data)
        ? payload.data.data
        : [];
    const names = Array.from(
      new Set(
        (rawResults as FlaskSearchResult[])
          .map((item) => item.nama)
          .filter((name): name is string => Boolean(name)),
      ),
    );

    if (!names.length) return [];

    let places = await getPlacesByNames(names);
    if (category) {
      places = places.filter((place) => place.kategori === category);
    }

    return places;
  } catch {
    return null;
  }
}

async function getPlacesFromSemanticSearch(search: string, category: string, page: number) {
  const places = await getSemanticPlaces(search, category);
  if (!places) return null;
  return paginatePlaces(places, page);
}

export async function getPlaceCount() {
  if (!isSupabaseConfigured()) return 0;

  const { count, error } = await supabase
    .from("places")
    .select("id", { count: "exact", head: true });

  if (error) return 0;
  return count ?? 0;
}

export async function getFeaturedPlaces(limit = 6) {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from("places")
    .select("*")
    .order("likes", { ascending: false, nullsFirst: false })
    .order("id", { ascending: true })
    .limit(limit);

  if (error) return [];
  return (data ?? []) as Place[];
}

export async function getCategories() {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from("places")
    .select("kategori")
    .not("kategori", "is", null)
    .order("kategori", { ascending: true })
    .limit(1000);

  if (error) return [];

  return Array.from(
    new Set((data ?? []).flatMap((item) => (item.kategori ? [item.kategori] : []))),
  );
}

export async function getPlaces(options: {
  page?: string;
  search?: string;
  category?: string;
}): Promise<PlaceListResult> {
  if (!isSupabaseConfigured()) {
    return emptyPlaceList();
  }

  const page = normalizePage(options.page);
  const search = cleanFilterValue(options.search);
  const category = cleanFilterValue(options.category);

  if (search) {
    const semanticResult = await getPlacesFromSemanticSearch(search, category, page);
    if (semanticResult) return semanticResult;
  }

  let query = supabase.from("places").select("*", { count: "exact" });

  if (category) {
    query = query.eq("kategori", category);
  }

  if (search) {
    const pattern = escapePostgrestPattern(search);
    query = query.or(
      `nama.ilike.%${pattern}%,kategori.ilike.%${pattern}%,deskripsi.ilike.%${pattern}%`,
    );
  }

  const { data, error } = await query
    .order("likes", { ascending: false, nullsFirst: false })
    .order("id", { ascending: true })
    .limit(1000);

  if (error) return emptyPlaceList(page);
  return paginatePlaces((data ?? []) as Place[], page);
}

export async function getPlacesForMap(options: {
  search?: string;
  category?: string;
}) {
  if (!isSupabaseConfigured()) return [];

  const search = cleanFilterValue(options.search);
  const category = cleanFilterValue(options.category);

  if (search) {
    const semanticPlaces = await getSemanticPlaces(search, category);
    if (semanticPlaces) return semanticPlaces;
  }

  let query = supabase.from("places").select("*");

  if (category) {
    query = query.eq("kategori", category);
  }

  if (search) {
    const pattern = escapePostgrestPattern(search);
    query = query.or(
      `nama.ilike.%${pattern}%,kategori.ilike.%${pattern}%,deskripsi.ilike.%${pattern}%`,
    );
  }

  const { data, error } = await query
    .order("likes", { ascending: false, nullsFirst: false })
    .order("id", { ascending: true })
    .limit(1000);

  if (error) return [];
  return (data ?? []) as Place[];
}

export async function getPlaceById(id: number) {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase.from("places").select("*").eq("id", id).single();
  if (error) return null;
  return data as Place;
}

export async function getFallbackRecommendations(place: Place, limit = 6) {
  if (!isSupabaseConfigured()) return [];

  let query = supabase.from("places").select("*").neq("id", place.id);
  if (place.kategori) query = query.eq("kategori", place.kategori);

  const { data, error } = await query
    .order("likes", { ascending: false, nullsFirst: false })
    .order("id", { ascending: true })
    .limit(limit);

  if (error) return [];
  return (data ?? []) as Place[];
}

export async function getPlacesByNames(names: string[]) {
  if (!isSupabaseConfigured() || names.length === 0) return [];

  const { data, error } = await supabase.from("places").select("*").in("nama", names);
  if (error) return [];

  const places = (data ?? []) as Place[];
  return places.sort((a, b) => names.indexOf(a.nama) - names.indexOf(b.nama));
}
