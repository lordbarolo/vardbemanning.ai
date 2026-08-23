import { createClient } from "@supabase/supabase-js";

// Externt Supabase-projekt (BYO) – publishable key är publik och får ligga i koden.
export const SUPABASE_URL = "https://zacslqpaqpzxmdyxwjll.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_wmaAmPHjmaYMmvYJ2MlJkA_7_Z4kZLj";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
