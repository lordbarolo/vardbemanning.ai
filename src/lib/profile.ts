import { supabase } from "@/integrations/supabase/client";

/**
 * Profilform enligt begärd backendändring (tabell public.profiles).
 * Tabellen ägs av backend-agenten – frontenden läser och skriver endast.
 */
export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  work_mode: "foretagare" | "anstalld" | null;
  role_code: string | null;
  municipality_code: string | null;
  company_name: string | null;
  company_org_nr: string | null;
  updated_at?: string | null;
};

export type ProfileFetchResult =
  | { status: "ok"; profile: Profile | null }
  | { status: "missing_table" }
  | { status: "error"; message: string };

const MISSING_TABLE_CODES = new Set(["PGRST205", "42P01"]);

export async function fetchMyProfile(userId: string): Promise<ProfileFetchResult> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone, work_mode, role_code, municipality_code, company_name, company_org_nr, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    if (MISSING_TABLE_CODES.has(error.code ?? "")) return { status: "missing_table" };
    return { status: "error", message: error.message };
  }

  return { status: "ok", profile: (data as Profile | null) ?? null };
}

export async function saveMyProfile(userId: string, values: Partial<Profile>) {
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...values }, { onConflict: "id" });
  if (error) throw new Error(error.message);
}
