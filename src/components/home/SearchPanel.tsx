import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, RefreshCw, Search } from "lucide-react";

import {
  fetchHeroCompensation,
  formatSek,
  searchMunicipalities,
  searchRoles,
  SOURCE_UNAVAILABLE_MESSAGE,
  type HeroCompensation,
  type MunicipalityHit,
  type RoleHit,
  type SourceResult,
} from "@/lib/compensation";

type ComboProps<T> = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (item: T) => void;
  search: (q: string) => Promise<SourceResult<T[]>>;
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
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const skipRef = useRef(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (skipRef.current) {
      skipRef.current = false;
      return;
    }
    const q = value.trim();
    if (q.length < 2) {
      setItems([]);
      setFailed(false);
      return;
    }
    let active = true;
    setLoading(true);
    const timer = setTimeout(() => {
      search(q)
        .then((result) => {
          if (!active) return;
          if (result.status === "unavailable") {
            setItems([]);
            setFailed(true);
          } else {
            setItems(result.status === "ok" ? result.data : []);
            setFailed(false);
          }
          setOpen(true);
        })
        .finally(() => active && setLoading(false));
    }, 220);
    return () => {
      active = false;
      clearTimeout(timer);
      setLoading(false);
    };
  }, [value, search, attempt]);

  return (
    <div className="relative">
      <div className="group relative">
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-4 top-2 z-10 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
        >
          {label}
        </label>
        <input
          id={id}
          value={value}
          autoComplete="off"
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => (items.length > 0 || failed) && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="h-[4.25rem] w-full rounded-xl border border-border/70 bg-secondary/40 px-4 pb-2 pt-7 pr-10 text-base font-medium text-foreground outline-none transition-all placeholder:font-normal placeholder:text-muted-foreground/70 hover:bg-secondary/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/40"
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Search className="h-4 w-4" aria-hidden="true" />
          )}
        </span>
      </div>

      {open && (failed || items.length > 0) && (
        <ul className="absolute z-40 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-border bg-popover p-1 shadow-2xl">
          {failed ? (
            <li>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setAttempt((n) => n + 1)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                Kunde inte hämta förslag — försök igen
              </button>
            </li>
          ) : (
            items.map((item) => (
              <li key={getKey(item)}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    skipRef.current = true;
                    onSelect(item);
                    setOpen(false);
                  }}
                  className="flex w-full flex-col items-start rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-muted"
                >
                  <span>{getLabel(item)}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {getHint(item)}
                  </span>
                </button>
              </li>
            ))
          )}
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
  const [notFound, setNotFound] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    const r = role.trim();
    const m = municipality.trim();
    if (r.length < 2 || m.length < 2) {
      setResult(null);
      setNotFound(false);
      setUnavailable(false);
      return;
    }
    let active = true;
    let autoRetry: ReturnType<typeof setTimeout> | undefined;
    let didAutoRetry = false;
    setLoading(true);

    const run = () => {
      fetchHeroCompensation(r, m)
        .then((res) => {
          if (!active) return;
          if (res.status === "unavailable") {
            // Aldrig ett gammalt eller gissat belopp kvar på skärmen.
            setResult(null);
            setNotFound(false);
            if (!didAutoRetry) {
              didAutoRetry = true;
              autoRetry = setTimeout(run, 1200);
              return;
            }
            setUnavailable(true);
          } else if (res.status === "empty") {
            setResult(null);
            setNotFound(true);
            setUnavailable(false);
          } else {
            setResult(res.data);
            setNotFound(false);
            setUnavailable(false);
          }
          setLoading(false);
        })
        .catch(() => {
          if (!active) return;
          setResult(null);
          setUnavailable(true);
          setLoading(false);
        });
    };

    const timer = setTimeout(run, 300);
    return () => {
      active = false;
      clearTimeout(timer);
      if (autoRetry) clearTimeout(autoRetry);
    };
  }, [role, municipality, attempt]);

  const uncertain =
    result && (result.role_match !== "exact" || result.municipality_match !== "exact");

  return (
    <div className="relative max-w-4xl rounded-2xl border border-border/80 bg-card/90 p-5 text-left shadow-2xl backdrop-blur-xl sm:p-7 md:p-8">
      <div className="mb-7">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-success">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          AI-analyserad avtalsdata
        </span>
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Se din marknadslön
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Få en estimering baserad på roll och geografi.
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

      {unavailable && !loading && (
        <div
          role="status"
          className="mt-4 flex flex-col gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-3 text-xs text-foreground sm:flex-row sm:items-center sm:justify-between"
        >
          <span>{SOURCE_UNAVAILABLE_MESSAGE}</span>
          <button
            type="button"
            onClick={retry}
            className="inline-flex shrink-0 items-center gap-1.5 rounded border border-border px-2.5 py-1 font-medium text-foreground hover:bg-muted"
          >
            <RefreshCw className="h-3 w-3" aria-hidden="true" />
            Försök igen
          </button>
        </div>
      )}

      {notFound && !loading && (
        <p className="mt-4 text-xs text-muted-foreground">
          Ingen träff på den kombinationen av roll och kommun.
        </p>
      )}

      {result && (
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Regionpris {formatSek(result.region_price)} kr/tim ·{" "}
          {result.contract_region}, zon {result.zone}
        </p>
      )}

      <div className="mt-2 grid gap-3 sm:grid-cols-2">
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

      <div className="mt-4 border-t border-border/60 pt-4 text-xs leading-relaxed text-muted-foreground">
        {result ? (
          <p>
            Artikelnr {result.article_number}. Marginal{" "}
            {Math.round(result.foretagare_margin * 100)} % (företagare) respektive{" "}
            {Math.round(result.anstalld_margin * 100)} % (löntagare), arbetsgivaravgift{" "}
            {(result.employer_social_fee * 100).toFixed(2).replace(".", ",")} % och
            tjänstepension {(result.occupational_pension * 100).toFixed(1).replace(".", ",")} %.
          </p>
        ) : unavailable ? (
          <p>
            Beloppen visas igen så snart avtalsdatan är nåbar. Vi visar aldrig
            uppskattade eller sparade priser — bara det som går att härleda till
            ramavtalet.
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
