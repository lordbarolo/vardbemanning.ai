// ENDA DATAVÄGEN för roller, kommuner, zoner, priser och ersättningsberäkning.
// All data hämtas via RPC mot projektets Supabase-databas. Prisdata får ALDRIG
// hårdkodas, cachas eller härledas i klienten — en siffra utan spårbarhet till
// avtalsdatan får inte visas för en användare eller en agent.
import { supabase } from "@/integrations/supabase/client";

export type RoleHit = {
  role_code: string;
  name: string;
  display_name?: string;
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
  foretagare_low: number;
  foretagare_high: number;
  anstalld_low: number;
  anstalld_high: number;
  margin_low: number;
  margin_high: number;
  catalog_version: string;
  display_name: string;
};

/**
 * Resultatform för alla anrop. "empty" = källan svarade men gav ingen träff.
 * "unavailable" = källan gick inte att nå — då visas inga belopp alls.
 */
export type SourceResult<T> =
  | { status: "ok"; data: T }
  | { status: "empty" }
  | { status: "unavailable"; message: string };

export type HeroResult = SourceResult<HeroCompensation> |
  { status: "candidates"; data: HeroCompensation[] };

export function classifyHeroRows(rows: HeroCompensation[]): HeroResult {
  if (rows.length === 0) return { status: "empty" };
  const row = rows[0];
  if (rows.length === 1 && row && row.role_match === "exact" && row.municipality_match === "exact") {
    return { status: "ok", data: row };
  }
  return { status: "candidates", data: rows };
}

export function logLookup(
  outcome: "single" | "candidates" | "empty",
  row?: HeroCompensation,
  candidateCount = 0,
) {
  // Fire and forget; only catalogue identifiers, never the original query.
  try {
    void Promise.resolve(supabase.rpc("log_lookup", {
      p_surface: "web",
      p_outcome: outcome,
      p_role_code: row?.role_code ?? null,
      p_municipality_code: row?.municipality_code ?? null,
      p_zone: row?.zone ?? null,
      p_role_match: row?.role_match ?? null,
      p_municipality_match: row?.municipality_match ?? null,
      p_candidate_count: candidateCount,
    })).catch(() => undefined);
  } catch {
    // Statistics must never affect the lookup or surface errors.
  }
}

export const SOURCE_UNAVAILABLE_MESSAGE =
  "Prisdatabasen svarar inte just nu. Inga belopp visas eftersom de alltid ska komma från avtalsdatan.";

function unavailable(error: unknown): { status: "unavailable"; message: string } {
  if (import.meta.env.DEV) {
    console.warn("[compensation] källan otillgänglig:", error);
  }
  return { status: "unavailable", message: SOURCE_UNAVAILABLE_MESSAGE };
}

export async function searchRoles(q: string): Promise<SourceResult<RoleHit[]>> {
  if (!q.trim()) return { status: "empty" };
  try {
    const { data, error } = await supabase.rpc("search_roles", { q });
    if (error) return unavailable(error);
    const rows = (data as RoleHit[]) ?? [];
    return rows.length > 0 ? { status: "ok", data: rows } : { status: "empty" };
  } catch (error) {
    return unavailable(error);
  }
}

export async function searchMunicipalities(
  q: string,
): Promise<SourceResult<MunicipalityHit[]>> {
  if (!q.trim()) return { status: "empty" };
  try {
    const { data, error } = await supabase.rpc("search_municipalities", { q });
    if (error) return unavailable(error);
    const rows = (data as MunicipalityHit[]) ?? [];
    return rows.length > 0 ? { status: "ok", data: rows } : { status: "empty" };
  } catch (error) {
    return unavailable(error);
  }
}

export async function fetchHeroCompensation(
  roleQuery: string,
  municipalityQuery: string,
): Promise<HeroResult> {
  try {
    const { data, error } = await supabase.rpc("hero_compensation", {
      role_query: roleQuery,
      municipality_query: municipalityQuery,
    });
    if (error) return unavailable(error);
    return classifyHeroRows((data as HeroCompensation[]) ?? []);
  } catch (error) {
    return unavailable(error);
  }
}

export function formatSek(value: number) {
  return new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(value);
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 2 }).format(value * 100);
}
