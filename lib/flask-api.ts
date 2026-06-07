import { getPlacesByNames } from "@/lib/places";
import type { Place } from "@/lib/types";

type FlaskRecommendation = {
  nama?: string;
};

const flaskBaseUrl = process.env.NEXT_PUBLIC_FLASK_API_URL?.replace(/\/$/, "");

export async function getRecommendationsFromFlask(place: Place, limit = 6) {
  if (!flaskBaseUrl) return [];

  try {
    const response = await fetch(`${flaskBaseUrl}/api/recommendations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        place_id: place.id,
        place_name: place.nama,
        top_n: limit,
      }),
      cache: "no-store",
    });

    if (!response.ok) return [];

    const payload = await response.json();
    const recommendations = (payload?.data?.recommendations ?? []) as FlaskRecommendation[];
    const names = recommendations.flatMap((item) => (item.nama ? [item.nama] : []));

    return getPlacesByNames(names).then((items) => items.slice(0, limit));
  } catch {
    return [];
  }
}
