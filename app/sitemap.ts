import type { MetadataRoute } from "next";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Place } from "@/lib/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const routes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/places`, lastModified: new Date() },
  ];

  if (!isSupabaseConfigured()) return routes;

  const { data } = await supabase.from("places").select("id, updated_at").limit(500);
  const places = (data ?? []) as Pick<Place, "id" | "updated_at">[];

  return routes.concat(
    places.map((place) => ({
      url: `${baseUrl}/places/${place.id}`,
      lastModified: place.updated_at ? new Date(place.updated_at) : new Date(),
    })),
  );
}
