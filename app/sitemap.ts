import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Place } from "@/lib/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: new Date() },
    { url: `${SITE_URL}/places`, lastModified: new Date() },
    { url: `${SITE_URL}/recommendations`, lastModified: new Date() },
  ];

  if (!isSupabaseConfigured()) return routes;

  const { data } = await supabase.from("places").select("id, updated_at").limit(500);
  const places = (data ?? []) as Pick<Place, "id" | "updated_at">[];

  return routes.concat(
    places.map((place) => ({
      url: `${SITE_URL}/places/${place.id}`,
      lastModified: place.updated_at ? new Date(place.updated_at) : new Date(),
    })),
  );
}
