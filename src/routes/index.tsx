import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { Hero } from "@/components/home/Hero";
import { SearchPanel } from "@/components/home/SearchPanel";
import LonekollenHero from "@/components/LonekollenHero";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vårdbemanning.ai – AI-verktyg för vårdkonsulter" },
      {
        name: "description",
        content:
          "Vårdbemanning.ai samlar smarta verktyg och AI som förenklar det administrativa och affärsmässiga för konsulter inom svensk vårdbemanning.",
      },
      { property: "og:title", content: "Vårdbemanning.ai – AI-verktyg för vårdkonsulter" },
      {
        property: "og:description",
        content: "AI-assistent och agentic search för svensk vårdbemanning.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});


const TRUST_POINTS = [
  "Baserat på officiella ramavtal",
  "Branschens marginalmodell (85–90 %)",
  "290 kommuner, alla specialiseringar",
  "Lika användbart för agenter som för människor",
];

function Wordmark() {
  return <Logo className="h-auto w-[clamp(10rem,20vw,13rem)]" />;
}

function Index() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="mono-home min-h-screen bg-background">
      {/* ── Nav ────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-md"
        role="navigation"
        aria-label="Huvudnavigation"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" aria-label="Vårdbemanning.ai startsida">
            <Wordmark />
          </Link>
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                Min sida
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                Logga in
              </Button>
            </Link>
          )}
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────── */}
      <Hero rightSlot={<SearchPanel />} />

      {/* ── Lönekollen ─────────────────────────────────── */}
      <LonekollenHero />


      {/* ── Trust ──────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-6 pb-12" aria-label="Datakällor">
        <div className="glass rounded-2xl p-8 md:p-10">
          <h2 className="mb-6 text-center text-2xl font-bold text-foreground">
            Verifierad marknadsdata
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {TRUST_POINTS.map((point) => (
              <div key={point} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-foreground" />
                <p className="text-sm text-muted-foreground">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="border-t border-border px-6 py-10" role="contentinfo">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <Wordmark />
          <div className="flex gap-6 text-sm text-muted-foreground">
            <span className="transition-colors hover:text-foreground">Vanliga frågor</span>
            <span className="transition-colors hover:text-foreground">Integritetspolicy</span>
            <span className="transition-colors hover:text-foreground">Din data</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Vårdbemanning.ai
          </p>
        </div>
      </footer>
    </div>
  );
}
