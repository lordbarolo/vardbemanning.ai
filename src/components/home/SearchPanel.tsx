import { useEffect, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";

import {
  fetchHeroCompensation,
  formatSek,
  searchMunicipalities,
  searchRoles,
  type HeroCompensation,
  type MunicipalityHit,
  type RoleHit,
} from "@/lib/compensation";

type ComboProps<T> = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (item: T) => void;
  search: (q: string) => Promise<T[]>;
  getKey: (item: T) => string;
  getLabel: (item: T) => string;
  getHint: (item: T) => string;
};

function Combobox<T>({
  id,
  label,
  placeholder,
  value,
  onChange,
  onSelect,
  search,
  getKey,
  getLabel,
  getHint,
}: ComboProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const skipRef = useRef(false);

  useEffect(() => {
    if (skipRef.current) {
      skipRef.current = false;
      return;
    }
    const q = value.trim();
    if (q.length < 2) {
      setItems([]);
      return;
    }
    let active = true;
    setLoading(true);
    const timer = setTimeout(() => {
      search(q)
        .then((hits) => {
          if (!active) return;
          setItems(hits);
          setOpen(true);
        })
        .catch(() => active && setItems([]))
        .finally(() => active && setLoading(false));
    }, 220);
    return () => {
      active = false;
      clearTimeout(timer);
      setLoading(false);
      clearTimeout(timer);
    };
  }, [value, search]);

  return (
    <div className="relative space-y-2">
      <label
        htmlFor={id}
        className="text-[10px] font-bold uppercase text-muted-foreground"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          value={value}
          autoComplete="off"
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => items.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="h-12 w-full rounded-md border border-border bg-input px-4 pr-10 text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Search className="h-4 w-4 opacity-50" aria-hidden="true" />
          )}
        </span>
      </div>

      {open && items.length > 0 && (
        <ul className="absolute z-40 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-card p-1 shadow-2xl">
          {items.map((item) => (
            <li key={getKey(item)}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  skipRef.current = true;
                  onSelect(item);
                  setOpen(false);
                }}
                className="flex w-full flex-col items-start rounded px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
              >
                <span>{getLabel(item)}</span>
                <span className="text-xs text-muted-foreground">{getHint(item)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Sökpanelen i hero — kopplad mot hero_compensation i databasen. */
export function SearchPanel() {
  const [role, setRole] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [result, setResult] = useState<HeroCompensation | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const r = role.trim();
    const m = municipality.trim();
    if (r.length < 2 || m.length < 2) {
      setResult(null);
      return;
    }
    let active = true;
    setLoading(true);
    setError("");
    const timer = setTimeout(() => {
      fetchHeroCompensation(r, m)
        .then((row) => {
          if (!active) return;
          setResult(row);
          if (!row) setError("Ingen träff på den kombinationen av roll och kommun.");
        })
        .catch((e) => active && setError(e instanceof Error ? e.message : "Något gick fel"))
        .finally(() => active && setLoading(false));
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [role, municipality]);

  const uncertain =
    result && (result.role_match !== "exact" || result.municipality_match !== "exact");

  return (
    <div className="relative max-w-4xl rounded-2xl border border-border/80 bg-card/90 p-5 text-left shadow-2xl backdrop-blur-xl sm:p-7 md:p-8">
      <div className="mb-7">
        <h2 className="mb-1 text-xs font-bold uppercase text-success">
          AI-indikator för konsultersättning
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Välj roll och kommun för att se möjlig ersättning.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Combobox<RoleHit>
          id="role-search"
          label="Roll"
          placeholder="t.ex. Ögonläkare"
          value={role}
          onChange={setRole}
          onSelect={(item) => setRole(item.name)}
          search={searchRoles}
          getKey={(item) => item.role_code}
          getLabel={(item) => item.name}
          getHint={(item) =>
            item.category === "lakare"
              ? "Läkare"
              : item.category === "barnmorska"
                ? "Barnmorska"
                : "Sjuksköterska"
          }
        />
        <Combobox<MunicipalityHit>
          id="municipality-search"
          label="Kommun"
          placeholder="t.ex. Torsby"
          value={municipality}
          onChange={setMunicipality}
          onSelect={(item) => setMunicipality(item.name)}
          search={searchMunicipalities}
          getKey={(item) => item.municipality_code}
          getLabel={(item) => item.name}
          getHint={(item) => `${item.contract_region} · zon ${item.zone}`}
        />
      </div>

      {uncertain && (
        <p className="mt-4 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-foreground">
          Osäker träff: vi tolkade sökningen som{" "}
          <strong>{result.role_name}</strong> i <strong>{result.municipality_name}</strong>.
          Kontrollera att det stämmer innan du använder beloppet.
        </p>
      )}

      {error && !loading && (
        <p className="mt-4 text-xs text-destructive">{error}</p>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border/70 bg-background/55 p-4 sm:p-5">
          <p className="mb-2 text-[10px] font-bold uppercase text-muted-foreground">
            Som företagare
          </p>
          <div className="flex min-h-9 items-baseline gap-2">
            <span className="text-3xl font-semibold text-foreground">
              {loading ? "…" : result ? formatSek(result.foretagare_hourly) : "—"}
            </span>
            <span className="text-xs text-muted-foreground">kr/timme</span>
          </div>
        </div>
        <div className="rounded-xl border border-border/70 bg-background/55 p-4 sm:p-5">
          <p className="mb-2 text-[10px] font-bold uppercase text-muted-foreground">
            Som löntagare
          </p>
          <div className="flex min-h-9 items-baseline gap-2">
            <span className="text-3xl font-semibold text-foreground">
              {loading ? "…" : result ? formatSek(result.anstalld_gross_hourly) : "—"}
            </span>
            <span className="text-xs text-muted-foreground">kr/timme brutto</span>
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-border/60 pt-4 text-xs leading-relaxed text-muted-foreground">
        {result ? (
          <p>
            Regionpris {formatSek(result.region_price)} kr/tim ·{" "}
            {result.contract_region}, zon {result.zone} · artikelnr{" "}
            {result.article_number}. Marginal{" "}
            {Math.round(result.foretagare_margin * 100)} % (företagare) respektive{" "}
            {Math.round(result.anstalld_margin * 100)} % (löntagare), arbetsgivaravgift{" "}
            {(result.employer_social_fee * 100).toFixed(2).replace(".", ",")} % och
            tjänstepension {(result.occupational_pension * 100).toFixed(1).replace(".", ",")} %.
          </p>
        ) : (
          <p>
            Beräkningen visas när du har valt roll och kommun. Underlaget bygger på
            officiella ramavtalspriser och visar vilka marginaler och avgifter som används.
          </p>
        )}
      </div>
    </div>
  );
}
