import { createClient } from "@supabase/supabase-js";

// Externt Supabase-projekt (BYO) – publishable key är publik och får ligga i koden.
export const SUPABASE_URL = "https://lfcttsyithbzyjtwronb.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Wmd6lb8FvIIo-lpnJ3aDAg_RB7hhK_G";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
