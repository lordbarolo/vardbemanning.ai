import { supabase } from "@/integrations/supabase/client";

export type RoleHit = {
  role_code: string;
  name: string;
  category: string;
  similarity: number;
};

export type MunicipalityHit = {
  municipality_code: string;
  name: string;
  zone: number;
  contract_region: string;
  similarity: number;
};

export type HeroCompensation = {
  role_code: string;
  role_name: string;
  category: string;
  role_match: string;
  municipality_code: string;
  municipality_name: string;
  county_name: string;
  contract_region: string;
  zone: number;
  municipality_match: string;
  article_number: string;
  region_price: number;
  foretagare_hourly: number;
  anstalld_gross_hourly: number;
  foretagare_margin: number;
  anstalld_margin: number;
  employer_social_fee: number;
  occupational_pension: number;
  currency: string;
  valid_from: string;
  valid_to: string;
};

export async function searchRoles(q: string): Promise<RoleHit[]> {
  if (!q.trim()) return [];
  const { data, error } = await supabase.rpc("search_roles", { q });
  if (error) throw new Error(error.message);
  return (data as RoleHit[]) ?? [];
}

export async function searchMunicipalities(q: string): Promise<MunicipalityHit[]> {
  if (!q.trim()) return [];
  const { data, error } = await supabase.rpc("search_municipalities", { q });
  if (error) throw new Error(error.message);
  return (data as MunicipalityHit[]) ?? [];
}

export async function fetchHeroCompensation(
  roleQuery: string,
  municipalityQuery: string,
): Promise<HeroCompensation | null> {
  const { data, error } = await supabase.rpc("hero_compensation", {
    role_query: roleQuery,
    municipality_query: municipalityQuery,
  });
  if (error) throw new Error(error.message);
  const rows = (data as HeroCompensation[]) ?? [];
  return rows[0] ?? null;
}

export function formatSek(value: number) {
  return new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(value);
}
