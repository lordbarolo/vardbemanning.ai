import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, ChevronsUpDown, Info, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

type RoleOption = {
  role_code: string;
  display_name: string;
  category: string | null;
};

type MunicipalityOption = {
  municipality_code: string;
  name: string;
};

type HeroCompensation = {
  role_name: string;
  role_match: string;
  municipality_name: string;
  municipality_match: string;
  county_name: string;
  zone: number;
  region_price: number;
  foretagare_hourly: number;
  anstalld_gross_hourly: number;
  foretagare_margin: number;
  anstalld_margin: number;
  employer_social_fee: number;
  occupational_pension: number;
};

const kr = new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 });
const pct = new Intl.NumberFormat("sv-SE", {
  style: "percent",
  maximumFractionDigits: 2,
});

function Combobox({
  label,
  placeholder,
  searchPlaceholder,
  emptyText,
  options,
  value,
  onChange,
  disabled,
}: {
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  options: { value: string; label: string; hint?: string | null }[];
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className="space-y-1.5">
      <span className="eyebrow block text-muted-foreground">{label}</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-label={label}
            disabled={disabled}
            className={cn(
              "flex w-full items-center justify-between rounded-lg border border-border bg-input px-4 py-3 text-left text-base transition-colors",
              "hover:border-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60",
              selected ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <span className="truncate">{selected?.label ?? placeholder}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-40" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[--radix-popover-trigger-width] p-0"
        >
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={`${option.label} ${option.hint ?? ""}`}
                    onSelect={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="truncate">{option.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/** Herosektionens sökpanel — alla belopp kommer från hero_compensation. */
export function HeroCompensationPanel() {
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [municipalities, setMunicipalities] = useState<MunicipalityOption[]>([]);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const [roleCode, setRoleCode] = useState<string | null>(null);
  const [municipalityCode, setMunicipalityCode] = useState<string | null>(null);

  const [result, setResult] = useState<HeroCompensation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBasis, setShowBasis] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      const [rolesRes, muniRes] = await Promise.all([
        supabase
          .from("role_zone_compensation")
          .select("role_code, display_name, category")
          .eq("zone", 1)
          .order("display_name"),
        supabase
          .from("municipalities")
          .select("municipality_code, name")
          .order("name"),
      ]);
      if (!active) return;
      if (rolesRes.error || muniRes.error) {
        setOptionsError(
          "Kunde inte hämta roller och kommuner. Försök igen om en stund.",
        );
        return;
      }
      setRoles((rolesRes.data ?? []) as RoleOption[]);
      setMunicipalities((muniRes.data ?? []) as MunicipalityOption[]);
    })();
    return () => {
      active = false;
    };
  }, []);

  const roleOptions = useMemo(
    () =>
      roles.map((r) => ({
        value: r.role_code,
        label: r.display_name,
        hint: r.category,
      })),
    [roles],
  );

  const municipalityOptions = useMemo(
    () =>
      municipalities.map((m) => ({
        value: m.municipality_code,
        label: m.name,
      })),
    [municipalities],
  );

  const selectedRole = roles.find((r) => r.role_code === roleCode) ?? null;
  const selectedMunicipality =
    municipalities.find((m) => m.municipality_code === municipalityCode) ?? null;
  const ready = Boolean(selectedRole && selectedMunicipality);

  // Nollställ resultatet när valen ändras — aldrig en siffra som inte hör till valet.
  useEffect(() => {
    setResult(null);
    setError(null);
    setShowBasis(false);
  }, [roleCode, municipalityCode]);

  async function fetchCompensation() {
    if (!selectedRole || !selectedMunicipality) return;
    setLoading(true);
    setError(null);
    setResult(null);
    const { data, error: rpcError } = await supabase.rpc("hero_compensation", {
      role_query: selectedRole.display_name,
      municipality_query: selectedMunicipality.name,
    });
    setLoading(false);
    const row = Array.isArray(data) ? data[0] : data;
    if (rpcError || !row) {
      setError(
        rpcError?.message ??
          "Ingen ersättning kunde hämtas för den kombinationen.",
      );
      return;
    }
    setResult(row as HeroCompensation);
  }

  const uncertain =
    result != null &&
    (result.role_match !== "exact" || result.municipality_match !== "exact");

  return (
    <div className="relative mx-auto w-full text-left">
      <div className="glass-strong overflow-hidden rounded-xl p-6 shadow-2xl md:p-10">
        <div className="-mx-6 -mt-6 mb-6 h-[2px] bg-foreground/5 md:-mx-10 md:-mt-10">
          <div className="h-full w-1/5 bg-gradient-to-r from-primary to-accent" />
        </div>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              AI-indikator för konsultersättning
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Välj yrke och ort så visar vi ersättningsnivån direkt.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Combobox
              label="Roll"
              placeholder="Välj yrke..."
              searchPlaceholder="Sök yrkesroll"
              emptyText="Ingen roll matchar sökningen."
              options={roleOptions}
              value={roleCode}
              onChange={setRoleCode}
              disabled={roleOptions.length === 0}
            />
            <Combobox
              label="Ort"
              placeholder="Välj kommun..."
              searchPlaceholder="Sök kommun"
              emptyText="Ingen kommun matchar sökningen."
              options={municipalityOptions}
              value={municipalityCode}
              onChange={setMunicipalityCode}
              disabled={municipalityOptions.length === 0}
            />
          </div>

          <Button
            size="lg"
            className="w-full text-base font-semibold"
            disabled={!ready || loading}
            onClick={() => void fetchCompensation()}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Hämtar ersättning...
              </>
            ) : (
              "Jämför min ersättning"
            )}
          </Button>

          {optionsError && (
            <p className="text-sm text-destructive" role="alert">
              {optionsError}
            </p>
          )}

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          {!result && !loading && !error && (
            <p className="text-sm text-muted-foreground">
              {ready
                ? "Klicka för att hämta aktuell ersättningsnivå."
                : "Välj både roll och ort för att se ersättningen."}
            </p>
          )}

          {result && (
            <div className="space-y-4">
              {uncertain && (
                <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-warning">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Osäker träff — beloppet bygger på en gissad matchning
                    ({result.role_name}, {result.municipality_name}). Bekräfta
                    valet innan du använder siffran.
                  </span>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="glass-subtle rounded-xl p-4">
                  <p className="eyebrow mb-1 text-muted-foreground">
                    Som företagare
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {kr.format(result.foretagare_hourly)}{" "}
                    <span className="text-base font-medium text-muted-foreground">
                      kr/tim
                    </span>
                  </p>
                </div>
                <div className="glass-subtle rounded-xl p-4">
                  <p className="eyebrow mb-1 text-muted-foreground">
                    Som löntagare
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {kr.format(result.anstalld_gross_hourly)}{" "}
                    <span className="text-base font-medium text-muted-foreground">
                      kr/tim brutto
                    </span>
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Regionens pris {kr.format(result.region_price)} kr/timme i{" "}
                {result.municipality_name} ({result.county_name}). Källa: SKR:s
                ramavtal 2026.
              </p>

              <div>
                <button
                  type="button"
                  onClick={() => setShowBasis((v) => !v)}
                  aria-expanded={showBasis}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <Info className="h-4 w-4" />
                  {showBasis ? "Dölj underlaget" : "Visa vad beloppet vilar på"}
                </button>
                {showBasis && (
                  <p className="mt-2 rounded-lg border border-border bg-input/60 p-3 text-sm leading-relaxed text-muted-foreground">
                    Regionens pris {kr.format(result.region_price)} kr.
                    Bemanningsföretagets marginal{" "}
                    {pct.format(result.foretagare_margin)} som företagare,{" "}
                    {pct.format(result.anstalld_margin)} som anställd.
                    Bruttolönen är det som återstår efter arbetsgivaravgift{" "}
                    {pct.format(result.employer_social_fee)} och tjänstepension{" "}
                    {pct.format(result.occupational_pension)}. Zon {result.zone}.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
