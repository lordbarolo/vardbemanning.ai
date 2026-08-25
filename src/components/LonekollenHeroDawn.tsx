/**
 * LonekollenHeroDawn — animationen som övergång från mörk hero till ljus sektion.
 *
 * Samma tidslinje, rörelser och innehåll som LonekollenHero, men färgerna är
 * funktioner av tiden: scenerna börjar i Deep Space-mörkret och landar i ett
 * ljust läge. Komponentens egen bakgrund är transparent så att sektionens
 * vertikala gradient syns igenom.
 */
import { useEffect, useRef, useState } from "react";

const F = "'Schibsted Grotesk','Helvetica Neue',Helvetica,sans-serif";
const MONO = "'IBM Plex Mono',monospace";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const P = (T: number, s: number, d: number) => clamp((T - s) / d, 0, 1);
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const fmt = (n: number) => Math.round(n).toLocaleString("sv-SE");

/* ── Färg ───────────────────────────────────────────────────────── */

const hex2rgb = (h: string): [number, number, number] => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];

const mix = (a: string, b: string, t: number) => {
  const [r1, g1, b1] = hex2rgb(a);
  const [r2, g2, b2] = hex2rgb(b);
  const c = (x: number, y: number) => Math.round(lerp(x, y, clamp(t, 0, 1)));
  return `rgb(${c(r1, r2)}, ${c(g1, g2)}, ${c(b1, b2)})`;
};

const rgba = (h: string, a: number) => {
  const [r, g, b] = hex2rgb(h);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

/* Deep Space → ljust. Motsvarar projektets tokens. */
const DARK = {
  ink: "#F2F0FA", // --foreground
  dim: "#A39CBF", // --muted-foreground
  line: "#2D2454", // --border
  card: "#171125", // --card
  track: "#241C3E",
};
const LIGHT = {
  ink: "#171125",
  dim: "#615A80",
  line: "#DFDAF0",
  card: "#FFFFFF",
  track: "#EAE6F7",
};

const PRIMARY = "#8257FF"; // --primary  hsl(256 100% 67%)
const ACCENT = "#FA4FC0"; // --accent   hsl(320 95% 65%)
const ON_PRIMARY = "#FFFFFF";

const Easing = {
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  easeOutQuart: (t: number) => 1 - Math.pow(1 - t, 4),
  easeInOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  easeOutBack: (t: number) => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2),
};

type Ease = (t: number) => number;

const animate =
  (o: { from: number; to: number; start: number; end: number; ease?: Ease }) =>
  (T: number) => {
    const e = o.ease || Easing.easeInOutCubic;
    return lerp(o.from, o.to, e(P(T, o.start, o.end - o.start)));
  };

const interpolate =
  (stops: number[], values: number[], ease: Ease = Easing.easeInOutCubic) =>
  (T: number) => {
    if (T <= stops[0]!) return values[0]!;
    for (let i = 0; i < stops.length - 1; i++) {
      if (T <= stops[i + 1]!) {
        const p = (T - stops[i]!) / (stops[i + 1]! - stops[i]!);
        return lerp(values[i]!, values[i + 1]!, ease(clamp(p, 0, 1)));
      }
    }
    return values[values.length - 1]!;
  };

/* Tidslinje — oförändrad */
const SCENES = [
  { name: "Oppning", dur: 3.5 },
  { name: "Roll", dur: 3 },
  { name: "Zon", dur: 3 },
  { name: "Belopp", dur: 4 },
  { name: "Notis", dur: 3.5 },
];
const CUES: Record<string, number> = {};
let acc = 0;
for (const s of SCENES) {
  CUES[s.name] = acc;
  acc += s.dur;
}
const AT = acc; // 17 s

const MOTION = {
  enter: (T: number, s: number, d = 0.6) => {
    const e = Easing.easeOutCubic(P(T, s, d));
    return { opacity: e, transform: "translateY(" + (1 - e) * 26 + "px)" };
  },
  pop: (T: number, s: number, d = 0.55) => {
    const p = P(T, s, d);
    return {
      opacity: clamp(p * 2.5, 0, 1),
      transform: "scale(" + (0.72 + 0.28 * Easing.easeOutBack(p)) + ")",
    };
  },
  draw: (T: number, s: number, d = 1) => Easing.easeInOutCubic(P(T, s, d)),
};

const CHIPS = ["Barnmorska", "Geriatriker", "Anestesiläkare", "IVA-sjuksköterska", "Leg. sjuksköterska"];
const SEL = 2, CHIP_W = 300, CHIP_H = 66, CHIP_GAP = 24, CHIP_Y = 548;
const chipX = (i: number) => (1920 - (5 * CHIP_W + 4 * CHIP_GAP)) / 2 + i * (CHIP_W + CHIP_GAP);

/* Anestesiläkare (rollkod 13400), avtalsår 2026 — r = regionpris, v = ersättning företagare */
const ZONES = [
  { t: "Zon 1", s: "Storstad", v: 1089.44, r: 1238 },
  { t: "Zon 2", s: "Mellannorrland", v: 1331.44, r: 1513 },
  { t: "Zon 3", s: "Glesbygd", v: 1572.56, r: 1787 },
];
const ZONE_W = 420, ZONE_H = 230, ZONE_GAP = 32, ZONE_Y = 470;
const zoneX = (i: number) => (1920 - (3 * ZONE_W + 2 * ZONE_GAP)) / 2 + i * (ZONE_W + ZONE_GAP);

function useClock(playing: boolean) {
  const [T, setT] = useState(0);
  const raf = useRef(0);
  const t0 = useRef(0);
  useEffect(() => {
    if (!playing) return;
    const step = (now: number) => {
      if (!t0.current) t0.current = now;
      setT((((now - t0.current) / 1000) % AT));
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [playing]);
  return T;
}

function Captions({ T, items, color }: { T: number; items: { at: number; until?: number; text: string }[]; color: string }) {
  const active = [...items].reverse().find((i) => T >= i.at && T <= (i.until ?? i.at + 2.6));
  if (!active) return null;
  const o = Easing.easeOutCubic(P(T, active.at, 0.35));
  return (
    <div
      style={{
        position: "absolute", left: 0, right: 0, bottom: "15%", textAlign: "center",
        font: "600 36px " + F, color, letterSpacing: -0.5, opacity: o,
      }}
    >
      {active.text}
    </div>
  );
}

export default function LonekollenHeroDawn({
  captions = true,
  className,
}: {
  captions?: boolean;
  className?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [visible, setVisible] = useState(true);
  const T = useClock(visible);

  /* Google Fonts injiceras en gång */
  useEffect(() => {
    const id = "lonekollen-fonts";
    if (document.getElementById(id)) return;
    const l = document.createElement("link");
    l.id = id;
    l.rel = "stylesheet";
    l.href =
      "https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap";
    document.head.appendChild(l);
  }, []);

  /* Skalar 1920×1080 till containerbredden */
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / 1920));
    ro.observe(el);
    setScale(el.clientWidth / 1920);
    return () => ro.disconnect();
  }, []);

  /* Pausar när hero är utanför vyn */
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => setVisible(e[0]?.isIntersecting ?? true), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const roll = CUES['Roll']!, zon = CUES['Zon']!, belopp = CUES['Belopp']!, notis = CUES['Notis']!;
  const D = MOTION.draw;

  /* Ljushetskurva: mörk i öppningen, ljus i slutet, tillbaka till mörk inför loopen */
  /**
   * Ljushet följer bakgrunden, inte klockan: sektionens gradient går från mörk
   * topp till ljus botten, så varje element färgas efter sitt eget y-läge.
   * Det håller kontrasten korrekt i varje bildruta.
   */
  const bgLum = (y: number) =>
    clamp(
      interpolate(
        [0, 0.18, 0.45, 0.72, 1],
        [0.0, 0.05, 0.18, 0.62, 1.0],
        Easing.easeInOutCubic
      )(clamp(y / 1080, 0, 1)),
      0,
      1
    );

  const tone = (y: number) => {
    const l = bgLum(y);
    return {
      l,
      ink: mix(DARK.ink, LIGHT.ink, l),
      dim: mix(DARK.dim, LIGHT.dim, l),
      line: mix(DARK.line, LIGHT.line, l),
      card: mix(DARK.card, LIGHT.card, l),
      track: mix(DARK.track, LIGHT.track, l),
      shadow:
        l < 0.5
          ? `0 18px 44px ${rgba("#05030F", 0.5 * (1 - l) + 0.12)}`
          : `0 14px 34px rgba(23, 17, 37, ${0.06 + 0.06 * (1 - l)})`,
    };
  };

  const glowStrength = 1;


  const worldO = D(T, 0.45, 0.5);
  const cam = interpolate(
    [0, roll, zon, belopp, belopp + 1.6, notis + 1.2, AT - 1.2],
    [1, 1.02, 1.035, 1.05, 1.09, 1.1, 1.0],
    Easing.easeInOutCubic
  )(T);
  const hUp = animate({ from: 0, to: -140, start: roll - 0.35, end: roll + 0.55 })(T);
  const hSc = animate({ from: 1, to: 0.72, start: roll - 0.35, end: roll + 0.55 })(T);
  const clickChip = roll + 1.75, clickZone = zon + 2.05;
  const selChip = T >= clickChip + 0.08, selZone = T >= clickZone + 0.08;
  const curEase = Easing.easeInOutCubic;
  const curX = interpolate(
    [roll + 0.9, roll + 1.6, zon + 1.1, zon + 1.95],
    [980, chipX(SEL) + CHIP_W / 2 + 8, chipX(SEL) + CHIP_W / 2 + 8, zoneX(2) + ZONE_W / 2 + 10],
    curEase
  )(T);
  const curY = interpolate(
    [roll + 0.9, roll + 1.6, zon + 1.1, zon + 1.95],
    [890, CHIP_Y + CHIP_H / 2 + 8, CHIP_Y + CHIP_H / 2 + 8, ZONE_Y + ZONE_H / 2 + 16],
    curEase
  )(T);
  const dip = (t0: number) => 1 - 0.16 * Math.sin(Math.PI * P(T, t0, 0.28));
  const curO = animate({ from: 0, to: 1, start: roll + 0.9, end: roll + 1.25 })(T) * (1 - D(T, belopp - 0.3, 0.4));
  const curS = dip(clickChip) * dip(clickZone);
  const mp = D(T, zon - 0.05, 0.75);
  const bigV = animate({ from: 0, to: 1572.56, start: belopp + 0.55, end: belopp + 2.3, ease: Easing.easeOutQuart })(T);
  const lonV = animate({ from: 0, to: 1787, start: belopp + 0.8, end: belopp + 2.4, ease: Easing.easeOutQuart })(T);
  const bar1 = D(T, belopp + 0.9, 1.1), bar2 = D(T, belopp + 1.15, 1.1);
  const wob = Math.sin((2 * Math.PI * T) / AT);

  const ring = (t0: number, cx: number, cy: number) => {
    const p = P(T, t0, 0.55);
    if (p <= 0 || p >= 1) return null;
    const s = 20 + 76 * Easing.easeOutCubic(p);
    return (
      <div
        style={{
          position: "absolute", left: cx - s / 2, top: cy - s / 2, width: s, height: s,
          borderRadius: "50%", border: "2.5px solid " + PRIMARY, opacity: 1 - p,
        }}
      />
    );
  };

  const chipRect = (i: number) =>
    i === SEL
      ? {
          left: lerp(chipX(SEL), 742, mp), top: lerp(CHIP_Y, 250, mp),
          width: lerp(CHIP_W, 236, mp), height: lerp(CHIP_H, 48, mp), fs: lerp(25, 19, mp),
        }
      : { left: chipX(i), top: CHIP_Y, width: CHIP_W, height: CHIP_H, fs: 25 };

  const captionItems = [
    { at: roll + 0.25, text: "1 · Välj din roll" },
    { at: zon + 0.25, text: "2 · Välj din zon" },
    { at: belopp + 0.4, text: "3 · Se vad du kan fakturera" },
    { at: notis + 0.35, until: AT - 1.2, text: "Få notis vid varje prisjustering" },
  ];

  return (
    <div ref={wrap} className={className} style={{ width: "100%", aspectRatio: "16 / 9", overflow: "hidden" }}>
      <div style={{ width: 1920, height: 1080, transform: "scale(" + scale + ")", transformOrigin: "top left", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", fontFamily: F }}>
          {/* Glow lever i den mörka övre halvan och tonar ut nedåt */}
          <div style={{ position: "absolute", left: 140 + 90 * wob, top: -180 + 40 * wob, width: 760, height: 760, borderRadius: "50%", background: `radial-gradient(circle, ${rgba(PRIMARY, 0.26 * glowStrength)} 0%, transparent 68%)` }} />
          <div style={{ position: "absolute", right: 80 - 90 * wob, bottom: -220 - 40 * wob, width: 860, height: 860, borderRadius: "50%", background: `radial-gradient(circle, ${rgba(ACCENT, 0.14 * glowStrength)} 0%, transparent 68%)` }} />

          <div style={{ position: "absolute", inset: 0, opacity: worldO, transform: "scale(" + cam + ")", transformOrigin: "960px 560px" }}>
            <div style={{ position: "absolute", left: 0, right: 0, textAlign: "center", transform: "translateY(" + hUp + "px) scale(" + hSc + ")", top: 230, transformOrigin: "50% 0%" }}>
              <div style={{ ...MOTION.enter(T, 0.8), fontSize: 116, fontWeight: 800, letterSpacing: -3.4, lineHeight: 1.0, color: tone(230 + hUp).ink }}>Vad är din tid värd?</div>
              <div style={{ ...MOTION.enter(T, 1.15), opacity: Easing.easeOutCubic(P(T, 1.15, 0.6)) * (1 - D(T, roll - 0.4, 0.4)), fontSize: 32, color: tone(370).dim, marginTop: 26, fontWeight: 600 }}>
                Transparent lönedata från regionernas ramavtal.
              </div>
            </div>


            {CHIPS.map((c, i) => {
              const r = chipRect(i);
              const inP = MOTION.pop(T, roll + 0.25 + i * 0.12);
              const outO = i === SEL ? 1 : 1 - D(T, zon - 0.15, 0.45);
              const sel = i === SEL && selChip;
              return (
                <div
                  key={c}
                  style={{
                    position: "absolute", left: r.left, top: r.top - (i === SEL ? 0 : 22 * D(T, zon - 0.15, 0.45)),
                    width: r.width, height: r.height, borderRadius: 999, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: r.fs, fontWeight: 600,
                    background: sel ? PRIMARY : CARD, color: sel ? ON_PRIMARY : INK,
                    border: "2px solid " + (sel ? PRIMARY : LINE),
                    boxShadow: sel ? `0 12px 30px ${rgba(PRIMARY, 0.45)}` : shadowSoft,
                    opacity: inP.opacity * outO, transform: inP.transform,
                  }}
                >
                  {c}
                </div>
              );
            })}

            <div style={{ ...MOTION.pop(T, belopp + 0.15), position: "absolute", left: 998, top: 250, width: 246, height: 48, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, fontWeight: 600, background: CARD, color: INK, border: "2px solid " + LINE, boxShadow: shadowSoft }}>
              Zon 3 · Glesbygd
            </div>

            {ZONES.map((z, i) => {
              const inP = MOTION.pop(T, zon + 0.3 + i * 0.15);
              const outP = D(T, belopp - 0.05, 0.5);
              const sel = i === 2 && selZone;
              return (
                <div
                  key={z.t}
                  style={{
                    position: "absolute", left: zoneX(i), top: ZONE_Y - 24 * outP - (sel ? 8 : 0),
                    width: ZONE_W, height: ZONE_H, borderRadius: 22, background: CARD,
                    border: sel ? "3px solid " + PRIMARY : "2px solid " + LINE,
                    boxShadow: sel ? `0 20px 46px ${rgba(PRIMARY, 0.4)}` : shadowSoft,
                    padding: "30px 34px", boxSizing: "border-box",
                    opacity: inP.opacity * (1 - outP), transform: inP.transform,
                  }}
                >
                  {sel && (
                    <div style={{ ...MOTION.pop(T, clickZone + 0.12, 0.4), position: "absolute", top: -16, right: 26, background: ACCENT, color: ON_PRIMARY, fontFamily: MONO, fontSize: 12.5, fontWeight: 600, letterSpacing: 1.5, padding: "7px 14px", borderRadius: 999, whiteSpace: "nowrap" }}>
                      HÖGST ERSÄTTNING
                    </div>
                  )}
                  <div style={{ fontSize: 31, fontWeight: 700, color: INK }}>{z.t}</div>
                  <div style={{ fontSize: 20, color: DIM, marginTop: 6 }}>{z.s}</div>
                  <div style={{ fontFamily: MONO, fontSize: 35, fontWeight: 600, marginTop: 26, lineHeight: 1.1, color: INK }}>
                    {fmt(z.r)} <span style={{ fontSize: 19, color: DIM }}>kr/h</span>
                  </div>
                  <div style={{ fontSize: 18, color: DIM, marginTop: 4, lineHeight: 1.2 }}>regionpris</div>
                </div>
              );
            })}

            <div style={{ ...MOTION.pop(T, belopp + 0.3, 0.6), position: "absolute", left: 580, top: 348, width: 760, height: 452, borderRadius: 26, background: CARD, border: "2px solid " + LINE, boxShadow: shadowSoft, padding: "42px 48px", boxSizing: "border-box" }}>
              <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: 3, fontWeight: 600, color: DIM }}>DIN ERSÄTTNING · ZON 3</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 18 }}>
                <div style={{ fontFamily: MONO, fontSize: 118, fontWeight: 700, letterSpacing: -3, fontVariantNumeric: "tabular-nums", color: INK }}>{fmt(bigV)}</div>
                <div style={{ fontSize: 34, color: DIM, fontWeight: 500 }}>kr/h</div>
              </div>
              <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ width: 160, fontSize: 21, fontWeight: 600, color: INK }}>Företagare</div>
                  <div style={{ width: 360, height: 14, borderRadius: 7, background: TRACK }}>
                    <div style={{ width: 360 * (1572.56 / 1787) * bar1, height: 14, borderRadius: 7, background: PRIMARY }} />
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 21, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: INK }}>{fmt(1572.56 * bar1)}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ width: 160, fontSize: 21, fontWeight: 600, color: DIM }}>Regionpris</div>
                  <div style={{ width: 360, height: 14, borderRadius: 7, background: TRACK }}>
                    <div style={{ width: 360 * bar2, height: 14, borderRadius: 7, background: mix("#5B4B92", "#B9AEE4", L) }} />
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 21, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: INK }}>{fmt(lonV)}</div>
                </div>
              </div>
              <div style={{ ...MOTION.enter(T, belopp + 2.4, 0.5), fontSize: 20, color: DIM, marginTop: 28, lineHeight: 1.3 }}>
                Anestesiläkare · Källa: SKR:s ramavtal 2026
              </div>
            </div>

            <div style={{ ...MOTION.pop(T, notis + 0.35, 0.55), position: "absolute", left: 1206, top: 300, width: 392, height: 108, borderRadius: 20, background: CARD, border: "2px solid " + LINE, boxShadow: shadowSoft, display: "flex", alignItems: "center", gap: 20, padding: "0 26px", boxSizing: "border-box" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: ON_PRIMARY, flexShrink: 0 }}>↑</div>
              <div>
                <div style={{ fontSize: 23, fontWeight: 700, color: INK }}>+4,2 % prisjustering</div>
                <div style={{ fontSize: 19, color: DIM, marginTop: 3 }}>Anestesiläkare, zon 3</div>
              </div>
            </div>

            {ring(clickChip, chipX(SEL) + CHIP_W / 2 + 8, CHIP_Y + CHIP_H / 2 + 8)}
            {ring(clickZone, zoneX(2) + ZONE_W / 2 + 10, ZONE_Y + ZONE_H / 2 + 16)}

            <div style={{ position: "absolute", left: curX, top: curY, opacity: curO, transform: "translate(-50%,-50%) scale(" + curS + ")", width: 26, height: 26, borderRadius: "50%", background: CARD, border: "2.5px solid " + rgba(PRIMARY, 0.7), boxShadow: shadowSoft }} />
          </div>
          {captions && <Captions T={T} items={captionItems} color={INK} />}
        </div>
      </div>
    </div>
  );
}
