import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseKey, supabaseUrl } from "@/lib/supabase-config";

const configured = isSupabaseConfigured();

if (!configured && process.env.NODE_ENV !== "production") {
  console.warn(
    "Supabase env is not configured. Fill NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
  );
}

export const supabase = createClient(
  configured ? supabaseUrl! : "https://example.supabase.co",
  configured ? supabaseKey! : "public-anon-key",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);

export function hasSupabaseConfig() {
  return configured;
}

export { isSupabaseConfigured };
