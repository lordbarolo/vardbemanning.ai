import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ChevronDown, Info, Loader2, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

type Option = { code: string; name: string };

type Compensation = {
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

const sek = new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 });
const percent = new Intl.NumberFormat("sv-SE", {
  style: "percent",
  maximumFractionDigits: 2,
});

/** Sökbar rullgardin byggd på en filtrerad lista — ingen extern combobox. */
function Picker({
  label,
  placeholder,
  searchLabel,
  options,
  selected,
  onSelect,
}: {
  label: string;
  placeholder: string;
  searchLabel: string;
  options: Option[];
  selected: Option | null;
  onSelect: (option: Option) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? options.filter((option) => option.name.toLowerCase().includes(q))
      : options;
    return list.slice(0, 120);
  }, [options, query]);

  return (
    <div className="space-y-2" ref={wrapRef}>
      <span className="eyebrow block text-muted-foreground">{label}</span>
      <div className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={label}
          disabled={options.length === 0}
          onClick={() => {
            setQuery("");
            setOpen((prev) => !prev);
          }}
          className={cn(
            "flex w-full items-center justify-between rounded-xl border border-border bg-card/60 px-5 py-4 text-left text-lg transition-colors",
            "hover:border-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60",
            selected ? "text-foreground" : "text-muted-foreground",
          )}
        >
          <span className="truncate">{selected?.name ?? placeholder}</span>
          <ChevronDown className="ml-3 h-5 w-5 shrink-0 opacity-50" />
        </button>

        {open && (
          <div className="glass-strong absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-border shadow-2xl">
            <div className="flex items-center gap-2 border-b border-border px-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchLabel}
                aria-label={searchLabel}
                className="w-full bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            <ul role="listbox" className="max-h-64 overflow-y-auto py-1">
              {matches.length === 0 ? (
                <li className="px-4 py-3 text-sm text-muted-foreground">
                  Inget matchar sökningen.
                </li>
              ) : (
                matches.map((option) => (
                  <li key={option.code}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected?.code === option.code}
                      onClick={() => {
                        onSelect(option);
                        setOpen(false);
                      }}
                      className={cn(
                        "w-full truncate px-4 py-2.5 text-left text-sm transition-colors hover:bg-primary/10",
                        selected?.code === option.code
                          ? "text-primary"
                          : "text-foreground",
                      )}
                    >
                      {option.name}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function Amount({
  label,
  value,
  loading,
}: {
  label: string;
  value: number | null;
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
      ) : value == null ? (
        <p className="text-4xl font-bold tracking-tight text-muted-foreground/40">–</p>
      ) : (
        <p className="text-4xl font-bold tracking-tight text-foreground">
          {sek.format(value)}{" "}
          <span className="text-base font-medium text-muted-foreground">kr/timme</span>
        </p>
      )}
    </div>
  );
}

/** Herosektionens panel — samtliga belopp kommer från hero_compensation. */
export function CompensationSearch() {
  const [roles, setRoles] = useState<Option[]>([]);
  const [places, setPlaces] = useState<Option[]>([]);
  const [listError, setListError] = useState<string | null>(null);

  const [role, setRole] = useState<Option | null>(null);
  const [place, setPlace] = useState<Option | null>(null);

  const [data, setData] = useState<Compensation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openBasis, setOpenBasis] = useState(false);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const [roleRes, placeRes] = await Promise.all([
        supabase
          .from("role_zone_compensation")
          .select("role_code, display_name")
          .eq("zone", 1)
          .order("display_name"),
        supabase
          .from("municipalities")
          .select("municipality_code, name")
          .order("name"),
      ]);
      if (!alive) return;
      if (roleRes.error || placeRes.error) {
        setListError("Kunde inte hämta roller och orter. Försök igen om en stund.");
        return;
      }
      setRoles(
        (roleRes.data ?? []).map((row) => ({
          code: String(row.role_code),
          name: String(row.display_name),
        })),
      );
      setPlaces(
        (placeRes.data ?? []).map((row) => ({
          code: String(row.municipality_code),
          name: String(row.name),
        })),
      );
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    setData(null);
    setError(null);
    setOpenBasis(false);
    if (!role || !place) return;

    let alive = true;
    setLoading(true);
    void (async () => {
      const { data: rows, error: rpcError } = await supabase.rpc("hero_compensation", {
        role_query: role.name,
        municipality_query: place.name,
      });
      if (!alive) return;
      setLoading(false);
      const row = Array.isArray(rows) ? rows[0] : rows;
      if (rpcError || !row) {
        setError(
          rpcError?.message ?? "Ingen ersättning kunde hämtas för den kombinationen.",
        );
        return;
      }
      setData(row as Compensation);
    })();
    return () => {
      alive = false;
    };
  }, [role, place]);

  const guessed =
    data != null &&
    (data.role_match !== "exact" || data.municipality_match !== "exact");

  return (
    <div className="glass-strong rounded-3xl p-6 text-left shadow-2xl md:p-8">
      <div className="space-y-6">
        <Picker
          label="Roll"
          placeholder="Välj roll..."
          searchLabel="Sök roll"
          options={roles}
          selected={role}
          onSelect={setRole}
        />
        <Picker
          label="Ort"
          placeholder="Välj ort..."
          searchLabel="Sök kommun"
          options={places}
          selected={place}
          onSelect={setPlace}
        />

        {listError && (
          <p className="text-sm text-destructive" role="alert">
            {listError}
          </p>
        )}

        <div className="space-y-4">
          <Amount
            label="Som företagare"
            value={data?.foretagare_hourly ?? null}
            loading={loading}
          />
          <Amount
            label="Som löntagare"
            value={data?.anstalld_gross_hourly ?? null}
            loading={loading}
          />
        </div>

        {guessed && data && (
          <div className="flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm text-warning">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Osäker träff — beloppet bygger på en gissad matchning ({data.role_name},{" "}
              {data.municipality_name}). Bekräfta valet innan du använder siffran.
            </span>
          </div>
        )}

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : data ? (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Regionens pris {sek.format(data.region_price)} kr/timme i{" "}
              {data.municipality_name} ({data.county_name}). Källa:{" "}
              <span className="underline decoration-muted-foreground/50 underline-offset-4">
                SKR:s ramavtal 2026
              </span>
              .
            </p>
            <div>
              <button
                type="button"
                onClick={() => setOpenBasis((prev) => !prev)}
                aria-expanded={openBasis}
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <Info className="h-4 w-4" />
                {openBasis ? "Dölj underlaget" : "Visa vad beloppet vilar på"}
              </button>
              {openBasis && (
                <p className="mt-2 rounded-xl border border-border bg-card/60 p-4 text-sm leading-relaxed text-muted-foreground">
                  Regionens pris {sek.format(data.region_price)} kr.
                  Bemanningsföretagets marginal {percent.format(data.foretagare_margin)}{" "}
                  som företagare, {percent.format(data.anstalld_margin)} som anställd.
                  Bruttolönen är det som återstår efter arbetsgivaravgift{" "}
                  {percent.format(data.employer_social_fee)} och tjänstepension{" "}
                  {percent.format(data.occupational_pension)}. Zon {data.zone}.
                </p>
              )}
            </div>
          </div>
        ) : (
          !loading && (
            <p className="text-sm text-muted-foreground">
              Välj roll och ort så visar vi ersättningen. Källa: SKR:s ramavtal 2026.
            </p>
          )
        )}
      </div>
    </div>
  );
}
