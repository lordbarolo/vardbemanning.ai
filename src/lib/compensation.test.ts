import { describe, expect, it, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: vi.fn().mockResolvedValue({ data: null, error: null }) } }));
import { supabase } from "@/integrations/supabase/client";
import { classifyHeroRows, formatPercent, formatSek, logLookup, type HeroCompensation } from "./compensation";
import { isInternalTraffic } from "./analytics";

const row: HeroCompensation = {
  role_code: "13500", role_name: "Specialistläkare ögonsjukdomar", display_name: "Ögonläkare",
  category: "lakare", role_match: "exact", municipality_code: "1737", municipality_name: "Torsby",
  county_name: "Värmlands län", contract_region: "Värmland", zone: 3, municipality_match: "exact",
  article_number: "313500", region_price: 1953, foretagare_hourly: 1708.88, anstalld_gross_hourly: 1257.27,
  foretagare_margin: .125, anstalld_margin: .125, employer_social_fee: .3142, occupational_pension: .045,
  currency: "SEK", valid_from: "2026-01-01", valid_to: "2026-12-31", catalog_version: "1.6",
  foretagare_low: 1660.05, foretagare_high: 1757.70, anstalld_low: 1221.34, anstalld_high: 1293.19,
  margin_low: .10, margin_high: .15,
};

describe("RPC-resultat och integritetsregler", () => {
  it("visar bara en exakt roll- och kommunträff direkt", () => {
    expect(classifyHeroRows([row])).toEqual({ status: "ok", data: row });
  });
  it("behåller samtliga kandidater när flera rader returneras", () => {
    const rows = [row, { ...row, role_code: "33010" }];
    expect(classifyHeroRows(rows)).toEqual({ status: "candidates", data: rows });
  });
  it.each(["prefix", "substring", "fuzzy"])("kräver kandidatval för rollträff %s", (match) => {
    expect(classifyHeroRows([{ ...row, role_match: match }]).status).toBe("candidates");
  });
  it("kräver kandidatval även vid osäker kommunträff", () => {
    expect(classifyHeroRows([{ ...row, municipality_match: "fuzzy" }]).status).toBe("candidates");
  });
  it("ger empty för noll rader", () => expect(classifyHeroRows([])).toEqual({ status: "empty" }));
  it("formaterar Ögonläkare Torsby till de begärda spannen", () => {
    expect([row.foretagare_low, row.foretagare_high].map(formatSek).join("–").replace(/\s/g, " ")).toBe("1 660–1 758");
    expect([row.anstalld_low, row.anstalld_high].map(formatSek).join("–").replace(/\s/g, " ")).toBe("1 221–1 293");
  });
  it("formaterar procentandelar med svensk decimalkomma", () => {
    expect(formatPercent(.3142)).toBe("31,42");
    expect(formatPercent(.045)).toBe("4,5");
    expect(formatPercent(.10)).toBe("10");
  });
  it("loggar endast katalogkoder och resultatmetadata", () => {
    logLookup("single", row, 1);
    expect(supabase.rpc).toHaveBeenCalledWith("log_lookup", {
      p_surface: "web", p_outcome: "single", p_role_code: "13500", p_municipality_code: "1737",
      p_zone: 3, p_role_match: "exact", p_municipality_match: "exact", p_candidate_count: 1,
    });
  });
  it("låter inte loggningsfel avbryta uppslaget", () => {
    vi.mocked(supabase.rpc).mockImplementationOnce(() => { throw new Error("offline"); });
    expect(() => logLookup("empty")).not.toThrow();
  });
  it.each(["localhost", "test.lovableproject.com", "demo.lovable.app", "id-preview--demo.example.com"])("markerar %s som intern trafik", (host) => {
    expect(isInternalTraffic(host)).toBe(true);
  });
  it("markerar inte publika domänen som intern trafik", () => expect(isInternalTraffic("vardbemanning.ai")).toBe(false));
});