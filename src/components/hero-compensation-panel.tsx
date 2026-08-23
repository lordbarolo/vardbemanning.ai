import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, ChevronDown, Info, Loader2 } from "lucide-react";

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

function SelectField({
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
    <div className="space-y-2">
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
              "flex w-full items-center justify-between rounded-xl border border-border bg-card/60 px-5 py-4 text-left text-lg transition-colors",
              "hover:border-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60",
              selected ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <span className="truncate">{selected?.label ?? placeholder}</span>
            <ChevronDown className="ml-3 h-5 w-5 shrink-0 opacity-50" />
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

function AmountCard({
  label,
  amount,
  loading,
}: {
  label: string;
  amount: number | null;
  loading: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/60 px-5 py-4">
      <p className="eyebrow mb-1 text-muted-foreground">{label}</p>
      {loading ? (
        <Loader2
          className="my-1 h-8 w-8 animate-spin text-muted-foreground"
          aria-label="Hämtar"
        />
      ) : amount == null ? (
        <p className="text-4xl font-bold tracking-tight text-muted-foreground/40">
          –
        </p>
      ) : (
        <p className="text-4xl font-bold tracking-tight text-foreground">
          {kr.format(amount)}{" "}
          <span className="text-base font-medium text-muted-foreground">
            kr/timme
          </span>
        </p>
      )}
    </div>
  );
}

/** Herosektionens panel — alla belopp kommer från hero_compensation. */
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

  const roleName = selectedRole?.display_name ?? null;
  const municipalityName = selectedMunicipality?.name ?? null;

  useEffect(() => {
    setResult(null);
    setError(null);
    setShowBasis(false);
    if (!roleName || !municipalityName) return;

    let active = true;
    setLoading(true);
    void (async () => {
      const { data, error: rpcError } = await supabase.rpc("hero_compensation", {
        role_query: roleName,
        municipality_query: municipalityName,
      });
      if (!active) return;
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
    })();
    return () => {
      active = false;
    };
  }, [roleName, municipalityName]);

  const uncertain =
    result != null &&
    (result.role_match !== "exact" || result.municipality_match !== "exact");

  return (
    <div className="glass-strong rounded-3xl p-6 text-left shadow-2xl md:p-8">
      <div className="space-y-6">
        <SelectField
          label="Roll"
          placeholder="Välj roll..."
          searchPlaceholder="Sök roll"
          emptyText="Ingen roll matchar sökningen."
          options={roleOptions}
          value={roleCode}
          onChange={setRoleCode}
          disabled={roleOptions.length === 0}
        />
        <SelectField
          label="Ort"
          placeholder="Välj ort..."
          searchPlaceholder="Sök kommun"
          emptyText="Ingen kommun matchar sökningen."
          options={municipalityOptions}
          value={municipalityCode}
          onChange={setMunicipalityCode}
          disabled={municipalityOptions.length === 0}
        />

        {optionsError && (
          <p className="text-sm text-destructive" role="alert">
            {optionsError}
          </p>
        )}

        <div className="space-y-4">
          <AmountCard
            label="Som företagare"
            amount={result?.foretagare_hourly ?? null}
            loading={loading}
          />
          <AmountCard
            label="Som löntagare"
            amount={result?.anstalld_gross_hourly ?? null}
            loading={loading}
          />
        </div>

        {uncertain && result && (
          <div className="flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm text-warning">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Osäker träff — beloppet bygger på en gissad matchning (
              {result.role_name}, {result.municipality_name}). Bekräfta valet
              innan du använder siffran.
            </span>
          </div>
        )}

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : result ? (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Regionens pris {kr.format(result.region_price)} kr/timme i{" "}
              {result.municipality_name} ({result.county_name}). Källa:{" "}
              <span className="underline decoration-muted-foreground/50 underline-offset-4">
                SKR:s ramavtal 2026
              </span>
              .
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
                <p className="mt-2 rounded-xl border border-border bg-card/60 p-4 text-sm leading-relaxed text-muted-foreground">
                  Regionens pris {kr.format(result.region_price)} kr.
                  Bemanningsföretagets marginal{" "}
                  {pct.format(result.foretagare_margin)} som företagare,{" "}
                  {pct.format(result.anstalld_margin)} som anställd. Bruttolönen
                  är det som återstår efter arbetsgivaravgift{" "}
                  {pct.format(result.employer_social_fee)} och tjänstepension{" "}
                  {pct.format(result.occupational_pension)}. Zon {result.zone}.
                </p>
              )}
            </div>
          </div>
        ) : (
          !loading && (
            <p className="text-sm text-muted-foreground">
              Välj roll och ort så visar vi ersättningen. Källa: SKR:s ramavtal
              2026.
            </p>
          )
        )}
      </div>
    </div>
  );
}
