/* ---------------------------------------------------------------------------
 * Lönekollen – loopad demoanimation för startsidan (sektionen under hero)
 * vardbemanning.ai
 *
 * Webbversion av animationen från Claude Design-handoffen. Skillnader mot
 * originalet (1920x1080-filmen) är medvetna och gjorda för sajten:
 *   - responsiv i stället för fast canvas (fungerar från 320 px och uppåt)
 *   - ingen brandmärkes-intro/outro (hero:n gör redan det jobbet)
 *   - ingen egen rubrik inne i animationen (sektionen har sin egen)
 *   - ljus panel i mörk ram så att den sitter ihop med resten av sidan
 *   - 14 s loop i stället för 17 s
 *   - flödet är roll -> kommun -> resultat, precis som hero_compensation.
 *     Zonen VÄLJS inte, den faller ut av kommunen och visas som ett resultat.
 *
 * TEKNIK
 * Alla animerade element delar `animation-duration: 14s` +
 * `animation-iteration-count: infinite`, så de ligger garanterat i fas.
 * Varje element placeras i tidslinjen med `animation-delay` (se BEATS nedan),
 * och varje keyframe börjar OCH slutar i dolt läge -> sömlös loop.
 * Ingen JS per bildruta förutom fyra sifferuppräkningar.
 *
 * Prestanda: animerar bara opacity/transform (kompositor-trådat), pausas helt
 * när sektionen är utanför vyn, respekterar prefers-reduced-motion.
 *
 * FÄRG: --lk-accent ärver sajtens gröna token (--success). Vill ni byta,
 * sätt --lk-accent på .lk-root eller på en förälder.
 * ------------------------------------------------------------------------- */

import { useEffect, useRef } from "react";

/* --- Tidslinje (sekunder in i loopen). Ändra här för att omtajma. -------- */
const LOOP = 14;

const BEATS = {
  step1: 0.2,
  s1title: 0.25,
  chips: [0.4, 0.47, 0.54, 0.61, 0.68],
  cursor1: 1.55,
  ring1: 2.62,
  sel1: 2.68,
  pillRoll: 2.88,

  step2: 4.4,
  s2title: 4.35,
  field: 4.42,
  opts: 4.5,
  optRows: [4.6, 4.67, 4.74],
  cursor2: 5.55,
  ring2: 6.62,
  sel2: 6.68,
  tag: 6.8,
  pillKommun: 6.98,

  step3: 8.45,
  card: 8.48,
  bars: [9.35, 9.5, 9.65],
  foot: 11.0,
  notis: 11.35,
  prog: 0.2,
} as const;

/* --- Demodata -------------------------------------------------------------
 * OBS: medvetet hårdkodat (beslut 2026-08-24). ANSVARSFORDELNING.md regel 5
 * säger att referensdata inte får hårdkodas i frontenden. Undantaget gäller
 * den här animationen, som är en illustration – inte ett prisbesked.
 *
 * Alla namn och tal är hämtade ur backend-repot `vardbemanning.ai` och stämmer
 * med `hero_compensation` per 2026-08-24:
 *
 *   Anestesiläkare = primäralias (role_aliases.is_primary) för 13400
 *   "Specialistläkare anestesi och intensivvård". Malå ligger i zon 3,
 *   vilket ger regionpris 1 787 kr/tim (roll_zonpris.csv).
 *
 *   företagare = 1787 * (1 - 0,12)                         = 1 572,56
 *   löntagare   = 1787 * (1 - 0,15) / (1 + 0,3142 + 0,045)  = 1 117,53
 *
 * Ändras priserna eller marginalerna i `compensation_assumptions` måste
 * REGION/FORETAGARE/LONTAGARE och stapelbredderna nedan räknas om för hand.
 * ------------------------------------------------------------------------- */

/* Visningsnamn ur role_aliases – alla finns på riktigt i katalogen. */
const ROLES = [
  "Barnmorska",
  "Sjuksköterska",
  "Anestesiläkare",
  "Geriatriker",
  "Distriktssjuksköterska",
];
const SEL_ROLE = 2;

/* Sökfrasen "mal" ger tre verkliga kommuner i två olika zoner – samma exempel
   som ANSVARSFORDELNING.md använder för att förklara varför kommunen spelar
   roll. Zonen visas först när kommunen är vald. */
const QUERY = "mal";
const MUNICIPALITIES = [
  { name: "Malmö", county: "Skåne län" },
  { name: "Malung-Sälen", county: "Dalarnas län" },
  { name: "Malå", county: "Västerbottens län" },
];
const SEL_MUN = 2;
const ZONE = 3;

const REGION = 1787;
const FORETAGARE = 1573; // 1 572,56 avrundat
const LONTAGARE = 1118; // 1 117,53 avrundat

/* Staplarna står i förhållande till regionpriset: 88,0 % och 62,5 %. */
const ROWS = [
  { key: "Regionens pris", to: REGION, w: 100, tone: "muted", start: 9.35 },
  { key: "Som företagare", to: FORETAGARE, w: 88.0, tone: "accent", start: 9.5 },
  { key: "Som löntagare", to: LONTAGARE, w: 62.5, tone: "soft", start: 9.65 },
] as const;

const BIG = { to: FORETAGARE, start: 9.15, dur: 1.75 };
const COUNT_DUR = 1.5;

const nf = new Intl.NumberFormat("sv-SE");
const clamp01 = (p: number) => (p < 0 ? 0 : p > 1 ? 1 : p);
const easeOutQuart = (p: number) => 1 - Math.pow(1 - p, 4);

const Cursor = () => (
  <svg viewBox="0 0 20 22" width="20" height="22" aria-hidden="true">
    <path
      d="M2 1.6 17.2 11 10.4 12.3 7.3 19.6z"
      fill="#fff"
      stroke="rgba(12,30,37,.8)"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

export type LonekollAnimationProps = {
  /** Visa sektionens rubrikblock. Sätt false om ni sätter rubriken själva. */
  showHeading?: boolean;
  className?: string;
};

export default function LonekollAnimation({
  showHeading = true,
  className = "",
}: LonekollAnimationProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const bigRef = useRef<HTMLSpanElement>(null);
  const rowRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;

    const write = (t: number) => {
      if (bigRef.current) {
        const p = easeOutQuart(clamp01((t - BIG.start) / BIG.dur));
        bigRef.current.textContent = nf.format(Math.round(BIG.to * p));
      }
      ROWS.forEach((r, i) => {
        const el = rowRefs.current[i];
        if (!el) return;
        const p = easeOutQuart(clamp01((t - r.start) / COUNT_DUR));
        el.textContent = nf.format(Math.round(r.to * p));
      });
    };

    /* Mindre rörelse: visa slutbilden, kör ingenting. */
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      write(LOOP);
      return;
    }

    let raf = 0;
    let playing = false;
    let inView = false;
    let clock: Animation | null = null;

    const tick = () => {
      if (!clock || clock.playState === "idle") {
        clock =
          stage
            .getAnimations()
            .find((an) => (an as CSSAnimation).animationName === "lk-clock") ??
          stage.getAnimations()[0] ??
          null;
      }
      const ms = clock ? Number(clock.currentTime ?? 0) : 0;
      write((ms / 1000) % LOOP);
      raf = requestAnimationFrame(tick);
    };

    /* Spola tillbaka så att berättelsen alltid börjar på steg 1. */
    const rewind = () => {
      root.getAnimations?.({ subtree: true }).forEach((an) => {
        try {
          an.currentTime = 0;
        } catch {
          /* vissa äldre motorer tillåter inte skrivning – strunt samma */
        }
      });
    };

    const start = (fromTheTop: boolean) => {
      if (playing) return;
      playing = true;
      if (fromTheTop) rewind();
      root.dataset.playing = "true";
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      playing = false;
      root.dataset.playing = "false";
      cancelAnimationFrame(raf);
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (inView) start(false);
    };
    document.addEventListener("visibilitychange", onVisibility);

    if (typeof IntersectionObserver !== "function") {
      inView = true;
      start(true);
      return () => {
        document.removeEventListener("visibilitychange", onVisibility);
        stop();
      };
    }

    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        if (inView) start(true);
        else stop();
      },
      { threshold: 0.25 },
    );
    io.observe(root);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      cancelAnimationFrame(raf);
    };
  }, []);

  const a = (name: string, delay: number) => ({
    animationName: name,
    animationDelay: `${delay}s`,
  });

  return (
    /* data-playing="true" som utgångsläge: skulle JS aldrig köra rullar
       animationen ändå i stället för att panelen står tom. */
    <section ref={rootRef} data-playing="true" className={`lk-root ${className}`}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {showHeading && (
        <header className="lk-head">
          <p className="lk-eyebrow">Så fungerar lönekollen</p>
          <h2 className="lk-h2">Två val – sen vet du vad du är värd</h2>
          <p className="lk-sub">
            Välj roll och kommun. Du ser vad regionen betalar, vad du kan
            fakturera som företagare och vad samma uppdrag ger som löntagare.
          </p>
        </header>
      )}

      <div
        className="lk-frame"
        role="img"
        aria-label={`Demo av lönekollen: rollen ${ROLES[SEL_ROLE]} väljs, sedan kommunen ${MUNICIPALITIES[SEL_MUN].name} som ligger i zon ${ZONE}. Regionens pris är ${REGION} kronor i timmen, ${FORETAGARE} kronor som företagare och ${LONTAGARE} kronor som löntagare.`}
      >
        <span className="lk-glow" aria-hidden="true" />

        <div className="lk-panel" aria-hidden="true">
          {/* ---- toppspår: val som fylls i efter hand ---- */}
          <div className="lk-rail">
            <span className="lk-brand">
              <i className="lk-brand-dot" />
              lönekollen
            </span>
            <span className="lk-pills">
              <span className="lk-a lk-pill" style={a("lk-in105", BEATS.pillRoll)}>
                <b>Roll</b>
                {ROLES[SEL_ROLE]}
              </span>
              <span className="lk-a lk-pill" style={a("lk-in63", BEATS.pillKommun)}>
                <b>Kommun</b>
                {MUNICIPALITIES[SEL_MUN].name}
              </span>
            </span>
          </div>

          {/* ---- scen ---- */}
          <div
            ref={stageRef}
            className="lk-a lk-stage"
            style={{ animationName: "lk-clock" }}
          >
            {/* Steg 1 – roll */}
            <div className="lk-screen">
              <p className="lk-a lk-slabel" style={a("lk-in39", BEATS.s1title)}>
                Vilken roll har du?
              </p>
              <div className="lk-chips">
                {ROLES.map((r, i) => (
                  <span
                    key={r}
                    className={`lk-a lk-chip${i === SEL_ROLE ? " is-target" : ""}`}
                    style={a("lk-in39", BEATS.chips[i])}
                  >
                    {i === SEL_ROLE && (
                      <>
                        <span
                          className="lk-a lk-selfill"
                          style={a("lk-sel", BEATS.sel1)}
                        />
                        <span
                          className="lk-a lk-ring"
                          style={a("lk-ring", BEATS.ring1)}
                        />
                        <span
                          className="lk-a lk-cursor"
                          style={a("lk-cursor", BEATS.cursor1)}
                        >
                          <Cursor />
                        </span>
                      </>
                    )}
                    <span className="lk-chip-txt">{r}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Steg 2 – kommun (sökfält + träfflista, som i sökpanelen) */}
            <div className="lk-screen">
              <p className="lk-a lk-slabel" style={a("lk-in39", BEATS.s2title)}>
                Var ligger uppdraget?
              </p>
              <div className="lk-combo">
                <span className="lk-a lk-field" style={a("lk-in39", BEATS.field)}>
                  <b>Kommun</b>
                  {QUERY}
                  <i className="lk-caret" />
                </span>
                <span className="lk-a lk-opts" style={a("lk-in39", BEATS.opts)}>
                  {MUNICIPALITIES.map((m, i) => (
                    <span
                      key={m.name}
                      className={`lk-a lk-opt${i === SEL_MUN ? " is-target" : ""}`}
                      style={a("lk-fade42", BEATS.optRows[i])}
                    >
                      {i === SEL_MUN && (
                        <span
                          className="lk-a lk-selfill"
                          style={a("lk-sel", BEATS.sel2)}
                        />
                      )}
                      <b>{m.name}</b>
                      <i>{m.county}</i>
                      {i === SEL_MUN && (
                        <>
                          {/* zonen är ett resultat av kommunen, inte ett val */}
                          <span className="lk-a lk-tag" style={a("lk-sel", BEATS.tag)}>
                            Zon {ZONE}
                          </span>
                          <span
                            className="lk-a lk-ring"
                            style={a("lk-ring", BEATS.ring2)}
                          />
                          <span
                            className="lk-a lk-cursor"
                            style={a("lk-cursor", BEATS.cursor2)}
                          >
                            <Cursor />
                          </span>
                        </>
                      )}
                    </span>
                  ))}
                </span>
              </div>
            </div>

            {/* Steg 3 – resultat */}
            <div className="lk-screen lk-screen--res">
              <div className="lk-a lk-card" style={a("lk-in50", BEATS.card)}>
                <p className="lk-card-eyebrow">
                  {ROLES[SEL_ROLE]} · {MUNICIPALITIES[SEL_MUN].name} · Zon {ZONE}
                </p>

                <p className="lk-big">
                  <span className="lk-num" ref={bigRef}>
                    {nf.format(FORETAGARE)}
                  </span>
                  <span className="lk-unit">
                    kr/tim<i>som företagare</i>
                  </span>
                </p>

                <div className="lk-rows">
                  {ROWS.map((r, i) => (
                    <span key={r.key} className="lk-row">
                      <span className="lk-row-key">{r.key}</span>
                      <span className="lk-track">
                        <span
                          className={`lk-a lk-fill is-${r.tone}`}
                          style={{
                            ...a("lk-bar", BEATS.bars[i]),
                            width: `${r.w}%`,
                          }}
                        />
                      </span>
                      <span
                        className="lk-row-val"
                        ref={(el) => {
                          rowRefs.current[i] = el;
                        }}
                      >
                        {nf.format(r.to)}
                      </span>
                    </span>
                  ))}
                </div>

                <p className="lk-a lk-foot" style={a("lk-in36", BEATS.foot)}>
                  Marginal 12 % · arbetsgivaravgift 31,42 % · tjänstepension
                  4,5 % · SKR:s ramavtal 2026
                </p>
              </div>

              <div className="lk-a lk-notis" style={a("lk-notis", BEATS.notis)}>
                <i className="lk-notis-ico">↑</i>
                <span>
                  <b>+4,2 % prisjustering</b>
                  <em>Notis skickad till dig</em>
                </span>
              </div>
            </div>
          </div>

          {/* ---- stegspår ---- */}
          <div className="lk-steps">
            {["Välj roll", "Välj kommun", "Se ersättningen"].map((s, i) => (
              <span key={s} className="lk-step">
                <span className="lk-step-txt">
                  <i>{i + 1}</i>
                  {s}
                </span>
                <span
                  className="lk-a lk-step-on"
                  style={a(
                    i === 2 ? "lk-fade52" : "lk-fade42",
                    [BEATS.step1, BEATS.step2, BEATS.step3][i],
                  )}
                >
                  <i>{i + 1}</i>
                  {s}
                </span>
              </span>
            ))}
            <span className="lk-prog">
              <span className="lk-a lk-prog-fill" style={a("lk-prog", BEATS.prog)} />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========================================================================= */

const CSS = `
.lk-root{
  /* Ärver sajtens gröna token, med fallback om --success saknas. */
  --lk-accent: hsl(var(--success, 160 60% 45%));
  --lk-accent-12: hsl(var(--success, 160 60% 45%) / .12);
  --lk-accent-22: hsl(var(--success, 160 60% 45%) / .22);
  --lk-accent-45: hsl(var(--success, 160 60% 45%) / .45);
  --lk-ink:#0C1E25; --lk-dim:#5E7B83; --lk-line:#DCE7EA; --lk-card:#fff;
  --lk-loop: 14s;
  --lk-play: running;
  position:relative; display:block; width:100%;
  margin-inline:auto; max-width:1200px;
  padding:56px 20px;
  /* glöden går utanför ramen med flit – klipp så den aldrig ger sidscroll */
  overflow-x:clip;
  font-family: var(--font-display, Inter, ui-sans-serif, system-ui, sans-serif);
  -webkit-font-smoothing:antialiased;
}
@media (min-width:768px){ .lk-root{ padding:80px 48px; } }
.lk-root[data-playing="false"]{ --lk-play: paused; }

/* ---------- rubrikblock (sajtens mörka färger) ---------- */
.lk-head{ max-width:640px; margin:0 0 28px; }
.lk-eyebrow{
  margin:0 0 10px; font-family: var(--font-mono, "JetBrains Mono", ui-monospace, monospace);
  font-size:11.5px; letter-spacing:.16em; text-transform:uppercase;
  color: var(--lk-accent);
}
.lk-h2{
  margin:0; font-size:clamp(26px,3.4vw,38px); line-height:1.12;
  letter-spacing:-.02em; font-weight:600; color: hsl(var(--foreground, 0 0% 100%));
}
.lk-sub{
  margin:12px 0 0; font-size:clamp(14.5px,1.4vw,16.5px); line-height:1.55;
  color: hsl(var(--muted-foreground, 230 8% 62%));
}

/* ---------- ram: mörk bezel så att den ljusa panelen sitter ihop ---------- */
.lk-frame{
  position:relative; border-radius:26px;
  padding:clamp(7px,1vw,12px);
  background:linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.02));
  border:1px solid hsl(var(--border, 230 10% 17%));
  box-shadow:0 40px 90px -34px rgba(0,0,0,.85), inset 0 1px 0 rgba(255,255,255,.05);
  isolation:isolate;
}
.lk-glow{
  position:absolute; z-index:-1; inset:-14% -8% auto -8%; height:70%;
  background:radial-gradient(58% 100% at 50% 0%, var(--lk-accent-22), transparent 72%);
  filter:blur(38px); pointer-events:none;
}

/* ---------- ljus panel ---------- */
.lk-panel{
  position:relative; overflow:hidden; border-radius:19px;
  background:linear-gradient(180deg,#F3F8F9 0%,#E6EEF0 100%);
  background-image:
    radial-gradient(90% 70% at 50% -10%, var(--lk-accent-12), transparent 60%),
    linear-gradient(180deg,#F5F9FA 0%,#E6EEF0 100%);
  color:var(--lk-ink);
  padding:14px 14px 12px;
}
@media (min-width:768px){ .lk-panel{ padding:18px 22px 16px; } }

/* ---------- toppspår ---------- */
.lk-rail{
  display:flex; align-items:center; gap:10px; flex-wrap:wrap;
  min-height:30px; padding-bottom:12px;
  border-bottom:1px solid var(--lk-line);
}
.lk-brand{
  display:inline-flex; align-items:center; gap:7px;
  font-family: var(--font-mono, "JetBrains Mono", ui-monospace, monospace);
  font-size:10.5px; letter-spacing:.18em; text-transform:uppercase; color:var(--lk-dim);
}
.lk-brand-dot{
  width:7px; height:7px; border-radius:50%; background:var(--lk-accent);
  box-shadow:0 0 0 3px var(--lk-accent-22);
}
.lk-pills{ display:flex; gap:7px; margin-left:auto; flex-wrap:wrap; justify-content:flex-end; }
.lk-pill{
  display:inline-flex; align-items:center; gap:7px;
  background:var(--lk-card); border:1px solid var(--lk-line); border-radius:999px;
  padding:5px 11px 5px 8px; font-size:12px; font-weight:600; white-space:nowrap;
  box-shadow:0 4px 12px rgba(12,30,37,.05);
}
.lk-pill b, .lk-field b{
  font-family: var(--font-mono, "JetBrains Mono", ui-monospace, monospace);
  font-size:9px; letter-spacing:.12em; text-transform:uppercase; font-weight:500;
  color:var(--lk-dim); background:#EEF4F5; border-radius:999px; padding:3px 6px;
}
@media (max-width:479px){ .lk-brand{ display:none; } .lk-pills{ margin-left:0; justify-content:flex-start; } .lk-pill{ font-size:11px; } }

/* ---------- scen ---------- */
.lk-stage{
  position:relative; contain:layout paint;
  height:clamp(310px, 40vw, 400px);
  margin:6px 0 2px;
}
@media (min-width:1024px){ .lk-stage{ height:404px; } }
.lk-screen{
  position:absolute; inset:0;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  gap:14px; pointer-events:none;
}
.lk-slabel{
  margin:0; font-size:clamp(15px,1.7vw,19px); font-weight:600; letter-spacing:-.01em;
  color:var(--lk-ink);
}

/* ---------- steg 1: rollchips ---------- */
.lk-chips{
  display:flex; flex-wrap:wrap; gap:9px; justify-content:center;
  max-width:880px;
}
.lk-chip{
  position:relative; display:inline-flex; align-items:center; justify-content:center;
  border-radius:999px; background:var(--lk-card); border:1px solid var(--lk-line);
  padding:9px 16px; font-size:clamp(12.5px,1.35vw,15px); font-weight:600;
  box-shadow:0 6px 16px rgba(12,30,37,.06);
}
.lk-chip.is-target{ z-index:3; }
.lk-chip-txt{ position:relative; z-index:2; }
.lk-selfill{
  position:absolute; inset:-1px; border-radius:inherit; z-index:1;
  background:var(--lk-accent-12);
  box-shadow:inset 0 0 0 2px var(--lk-accent), 0 10px 24px var(--lk-accent-45);
}

/* ---------- steg 2: kommunsökning ---------- */
.lk-combo{ display:flex; flex-direction:column; gap:8px; width:min(100%,430px); }
.lk-field{
  display:flex; align-items:center; gap:9px;
  background:var(--lk-card); border:1px solid var(--lk-line); border-radius:12px;
  padding:11px 14px; box-shadow:0 6px 16px rgba(12,30,37,.06);
  font-size:clamp(13px,1.4vw,15px); font-weight:600;
}
.lk-caret{
  width:1.5px; height:15px; margin-left:-5px; background:var(--lk-ink);
  animation:lk-blink 1.1s steps(1) infinite;
  animation-play-state:var(--lk-play);
}
.lk-opts{
  display:flex; flex-direction:column; gap:3px;
  background:var(--lk-card); border:1px solid var(--lk-line); border-radius:12px;
  padding:6px; box-shadow:0 14px 32px rgba(12,30,37,.1);
}
.lk-opt{
  position:relative; display:flex; align-items:center; gap:10px;
  padding:9px 12px; border-radius:8px;
  font-size:clamp(12.5px,1.35vw,14.5px);
}
.lk-opt.is-target{ z-index:3; }
.lk-opt .lk-selfill{ border-radius:8px; }
.lk-opt b{ position:relative; z-index:2; font-weight:600; }
.lk-opt i{
  position:relative; z-index:2; margin-left:auto; font-style:normal;
  font-size:11.5px; color:var(--lk-dim); white-space:nowrap;
}
.lk-tag{
  position:relative; z-index:2; flex:none; margin-left:9px;
  background:var(--lk-accent); color:#06231B;
  font-family: var(--font-mono, "JetBrains Mono", ui-monospace, monospace);
  font-size:9px; font-weight:600; letter-spacing:.12em; text-transform:uppercase;
  padding:4px 8px; border-radius:999px; white-space:nowrap;
}

/* ---------- markör + klickring ---------- */
.lk-cursor{
  position:absolute; z-index:6; left:50%; top:50%; margin:-11px 0 0 -10px;
  filter:drop-shadow(0 6px 12px rgba(12,30,37,.3));
}
.lk-ring{
  position:absolute; z-index:5; left:calc(50% + 10px); top:calc(50% + 12px);
  width:56px; height:56px; border-radius:50%;
  border:2px solid var(--lk-accent);
}

/* ---------- steg 3: resultat ---------- */
.lk-screen--res{ justify-content:center; }
.lk-card{
  width:min(100%,560px);
  background:var(--lk-card); border:1px solid var(--lk-line); border-radius:18px;
  padding:clamp(16px,2.2vw,24px);
  box-shadow:0 22px 50px rgba(12,30,37,.1);
}
.lk-card-eyebrow{
  margin:0; font-family: var(--font-mono, "JetBrains Mono", ui-monospace, monospace);
  font-size:10px; letter-spacing:.15em; text-transform:uppercase; color:var(--lk-dim);
}
.lk-big{ margin:8px 0 0; display:flex; align-items:baseline; gap:10px; }
.lk-num{
  font-family: var(--font-mono, "JetBrains Mono", ui-monospace, monospace);
  font-size:clamp(38px,6.4vw,62px); font-weight:700; letter-spacing:-.035em;
  line-height:1; font-variant-numeric:tabular-nums;
}
.lk-unit{ display:flex; flex-direction:column; font-size:15px; font-weight:600; color:var(--lk-dim); }
.lk-unit i{ font-style:normal; font-size:11.5px; font-weight:500; color:var(--lk-accent); }

.lk-rows{ margin-top:16px; display:flex; flex-direction:column; gap:9px; }
.lk-row{ display:flex; align-items:center; gap:10px; }
.lk-row-key{ width:clamp(88px,13vw,120px); flex:none; font-size:clamp(11.5px,1.2vw,13px); color:var(--lk-dim); }
.lk-track{ flex:1; height:9px; border-radius:5px; background:#EAF1F3; overflow:hidden; }
.lk-fill{ display:block; height:100%; border-radius:5px; transform-origin:left center; }
.lk-fill.is-muted{ background:#B9CDD2; }
.lk-fill.is-accent{ background:var(--lk-accent); }
.lk-fill.is-soft{ background:var(--lk-accent-45); }
.lk-row-val{
  width:52px; flex:none; text-align:right;
  font-family: var(--font-mono, "JetBrains Mono", ui-monospace, monospace);
  font-size:clamp(12px,1.3vw,14px); font-weight:600; font-variant-numeric:tabular-nums;
}
.lk-foot{ margin:14px 0 0; font-size:11px; line-height:1.45; color:var(--lk-dim); }

.lk-notis{
  /* lägger sig i resultatkortets nedre högra hörn (kortet är max 560 px och
     centrerat), men trycks aldrig utanför scenen på smalare skärmar */
  position:absolute; right:max(0px, calc(50% - 310px)); bottom:40px; z-index:4;
  display:flex; align-items:center; gap:11px;
  background:var(--lk-card); border:1px solid var(--lk-line); border-radius:14px;
  padding:10px 14px; box-shadow:0 18px 40px rgba(12,30,37,.18);
}
.lk-notis-ico{
  width:30px; height:30px; flex:none; border-radius:50%; background:var(--lk-accent);
  color:#06231B; font-style:normal; font-weight:800; font-size:15px;
  display:flex; align-items:center; justify-content:center;
}
.lk-notis span{ display:flex; flex-direction:column; }
.lk-notis b{ font-size:13px; font-weight:600; letter-spacing:-.01em; }
.lk-notis em{ font-style:normal; font-size:11px; color:var(--lk-dim); margin-top:1px; }
/* Centrera utan transform – animationen äger transform-egenskapen och
   skulle annars skriva över en translateX(-50%). */
@media (max-width:639px){
  .lk-notis{ left:0; right:0; bottom:0; width:max-content; max-width:100%; margin-inline:auto; }
  .lk-notis b{ font-size:12px; }
  .lk-screen--res{ justify-content:flex-start; padding-top:4px; }
}

/* ---------- stegspår ---------- */
.lk-steps{
  position:relative; display:flex; gap:clamp(10px,3vw,34px);
  padding-top:12px; border-top:1px solid var(--lk-line);
}
.lk-step{ position:relative; }
.lk-step-txt, .lk-step-on{
  display:inline-flex; align-items:center; gap:7px; white-space:nowrap;
  font-size:clamp(11px,1.2vw,13px); font-weight:600; color:var(--lk-dim); opacity:.6;
}
.lk-step-txt i, .lk-step-on i{
  font-style:normal; width:17px; height:17px; border-radius:50%;
  display:inline-flex; align-items:center; justify-content:center;
  font-size:10px; font-weight:700; background:#DFE9EB; color:var(--lk-dim);
}
.lk-step-on{
  position:absolute; inset:0; opacity:1; color:var(--lk-ink);
}
.lk-step-on i{ background:var(--lk-accent); color:#06231B; }
.lk-prog{
  position:absolute; left:0; right:0; top:-1px; height:2px;
  border-radius:2px; overflow:hidden;
}
.lk-prog-fill{ display:block; height:100%; width:100%; background:var(--lk-accent); transform-origin:left center; }

/* ---------- animationsmotor ---------- */
.lk-root .lk-a{
  animation-duration: var(--lk-loop);
  animation-iteration-count: infinite;
  animation-fill-mode: both;
  animation-timing-function: cubic-bezier(.22,.68,.24,1);
  animation-play-state: var(--lk-play);
}
.lk-root .lk-fill, .lk-root .lk-prog-fill, .lk-root .lk-stage{ animation-timing-function: linear; }

@keyframes lk-clock{ from{ opacity:.999 } to{ opacity:1 } }
@keyframes lk-blink{ 0%,50%{ opacity:1 } 51%,100%{ opacity:0 } }

/* in 0.45s · synlig 3.9s · ut 0.4s */
@keyframes lk-in39{
  0%     { opacity:0; transform:translateY(10px) scale(.96) }
  3.21%  { opacity:1; transform:none }
  27.86% { opacity:1; transform:none }
  30.71% { opacity:0; transform:translateY(-8px) scale(.98) }
  100%   { opacity:0; transform:translateY(10px) scale(.96) }
}
/* in 0.45s · synlig 3.6s · ut 0.4s */
@keyframes lk-in36{
  0%     { opacity:0; transform:translateY(10px) scale(.96) }
  3.21%  { opacity:1; transform:none }
  25.71% { opacity:1; transform:none }
  28.57% { opacity:0; transform:translateY(-8px) scale(.98) }
  100%   { opacity:0; transform:translateY(10px) scale(.96) }
}
/* resultatkortet: in 0.45s · synlig 5.0s · ut 0.4s */
@keyframes lk-in50{
  0%     { opacity:0; transform:translateY(14px) scale(.975) }
  3.21%  { opacity:1; transform:none }
  35.71% { opacity:1; transform:none }
  38.57% { opacity:0; transform:translateY(-10px) scale(.985) }
  100%   { opacity:0; transform:translateY(14px) scale(.975) }
}
/* rollpillret: synligt 10.35s */
@keyframes lk-in105{
  0%     { opacity:0; transform:translateY(-6px) scale(.9) }
  2.86%  { opacity:1; transform:none }
  73.93% { opacity:1; transform:none }
  76.79% { opacity:0; transform:scale(.94) }
  100%   { opacity:0; transform:translateY(-6px) scale(.9) }
}
/* kommunpillret: synligt 6.3s */
@keyframes lk-in63{
  0%     { opacity:0; transform:translateY(-6px) scale(.9) }
  2.86%  { opacity:1; transform:none }
  45%    { opacity:1; transform:none }
  47.86% { opacity:0; transform:scale(.94) }
  100%   { opacity:0; transform:translateY(-6px) scale(.9) }
}
/* markeringsfyll: in 0.18s · synlig 1.9s · ut 0.25s */
@keyframes lk-sel{
  0%     { opacity:0; transform:scale(.94) }
  1.29%  { opacity:1; transform:none }
  13.57% { opacity:1; transform:none }
  15.36% { opacity:0; transform:scale(.99) }
  100%   { opacity:0; transform:scale(.94) }
}
/* markören: kommer in, glider fram, klickar, lämnar */
@keyframes lk-cursor{
  0%     { opacity:0; transform:translate(-72px,54px) scale(1) }
  1.79%  { opacity:1; transform:translate(-72px,54px) scale(1); animation-timing-function:cubic-bezier(.5,0,.15,1) }
  7.14%  { opacity:1; transform:translate(10px,12px) scale(1) }
  8.21%  { opacity:1; transform:translate(10px,12px) scale(.8) }
  9.29%  { opacity:1; transform:translate(10px,12px) scale(1) }
  9.64%  { opacity:1; transform:translate(10px,12px) scale(1) }
  11.43% { opacity:0; transform:translate(30px,-8px) scale(.9) }
  100%   { opacity:0; transform:translate(-72px,54px) scale(1) }
}
/* 0 % måste vara dolt – annars visar backwards-fill ringen under hela
   fördröjningen innan klicket. Därav den lilla trappan på 0.01 %. */
@keyframes lk-ring{
  0%     { opacity:0;   transform:translate(-50%,-50%) scale(.28) }
  .01%   { opacity:.85; transform:translate(-50%,-50%) scale(.28) }
  3.93%  { opacity:0;   transform:translate(-50%,-50%) scale(2.1) }
  100%   { opacity:0;   transform:translate(-50%,-50%) scale(.28) }
}
/* staplarna växer på 1.2s, nollställs långt efter att kortet försvunnit */
@keyframes lk-bar{
  0%     { transform:scaleX(0) }
  8.57%  { transform:scaleX(1) }
  38.5%  { transform:scaleX(1) }
  38.6%  { transform:scaleX(0) }
  100%   { transform:scaleX(0) }
}
@keyframes lk-notis{
  0%     { opacity:0; transform:translate(14px,14px) scale(.9) }
  3.57%  { opacity:1; transform:none }
  14.29% { opacity:1; transform:none }
  17.14% { opacity:0; transform:translateY(-6px) scale(.97) }
  100%   { opacity:0; transform:translate(14px,14px) scale(.9) }
}
@keyframes lk-prog{
  0%     { transform:scaleX(0); opacity:1 }
  97.14% { transform:scaleX(1); opacity:1 }
  98.57% { transform:scaleX(1); opacity:0 }
  98.6%  { transform:scaleX(0); opacity:0 }
  100%   { transform:scaleX(0); opacity:1 }
}
@keyframes lk-fade42{ 0%{opacity:0} 2.86%{opacity:1} 30%{opacity:1} 32.86%{opacity:0} 100%{opacity:0} }
@keyframes lk-fade52{ 0%{opacity:0} 2.86%{opacity:1} 37.14%{opacity:1} 40%{opacity:0} 100%{opacity:0} }

/* mobilen: markören får inte peka utanför panelen */
@media (max-width:479px){
  @keyframes lk-cursor{
    0%     { opacity:0; transform:translate(-40px,40px) scale(.9) }
    1.79%  { opacity:1; transform:translate(-40px,40px) scale(.9); animation-timing-function:cubic-bezier(.5,0,.15,1) }
    7.14%  { opacity:1; transform:translate(8px,10px) scale(.9) }
    8.21%  { opacity:1; transform:translate(8px,10px) scale(.72) }
    9.29%  { opacity:1; transform:translate(8px,10px) scale(.9) }
    9.64%  { opacity:1; transform:translate(8px,10px) scale(.9) }
    11.43% { opacity:0; transform:translate(22px,-6px) scale(.8) }
    100%   { opacity:0; transform:translate(-40px,40px) scale(.9) }
  }
}

/* ---------- mindre rörelse: visa slutbilden ---------- */
@media (prefers-reduced-motion: reduce){
  .lk-root .lk-a{ animation:none !important; }
  .lk-root .lk-caret{ animation:none !important; }
  .lk-root .lk-screen:not(.lk-screen--res),
  .lk-root .lk-cursor,
  .lk-root .lk-ring,
  .lk-root .lk-step:nth-child(1) .lk-step-on,
  .lk-root .lk-step:nth-child(2) .lk-step-on{ display:none; }
  .lk-root .lk-stage{ height:auto; min-height:0; padding:18px 0 8px; }
  .lk-root .lk-screen--res{ position:relative; inset:auto; }
  .lk-root .lk-notis{ position:relative; right:auto; left:auto; bottom:auto; transform:none; margin:14px auto 0; }
}
`;
