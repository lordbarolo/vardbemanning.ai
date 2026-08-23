import { createClient } from "@supabase/supabase-js";

// Externt Supabase-projekt (BYO) – publishable key är publik och får ligga i koden.
export const SUPABASE_URL = "https://lfcttsyithbzyjtwronb.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmY3R0c3lpdGhienlqdHdyb25iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0NDQwMjYsImV4cCI6MjEwMzAyMDAyNn0.rKtqB7TCqA-nLa-VOCJv2MXXs1EO8ZjIZiRRW7mMthU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
