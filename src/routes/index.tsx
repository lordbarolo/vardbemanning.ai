import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  FileSearch,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";

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

const PILLARS = [
  {
    id: "salary-analysis",
    question: "Tjänar jag rätt?",
    title: "Ersättningsanalys",
    description:
      "Jämför din ersättning med ramavtalspriserna i realtid. 290 kommuner, alla specialiseringar — för konsulter och de som vill bli det.",
    icon: ShieldCheck,
    cta: "Analysera din ersättning",
  },
  {
    id: "invoice-audit",
    question: "Fakturerar jag rätt?",
    title: "Fakturagranskning",
    description:
      "AI-assistenten granskar dina fakturor retroaktivt för att se om du missat att fakturera för redan arbetad tid. Finns det avvikelser hittar vi dem.",
    icon: FileSearch,
    cta: "Granska fakturor",
  },
  {
    id: "negotiation-agent",
    question: "Förhandlar jag rätt?",
    title: "Förhandlingsassistent",
    description:
      "Ställ frågor om marknadspriser, avtalsvillkor och förhandlingsstrategier. Assistenten ger dig underlag inför ditt nästa konsultuppdrag.",
    icon: MessageSquare,
    cta: "Starta förhandling",
  },
] as const;

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
    <div className="min-h-screen bg-background">
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
      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <LonekollenHero />
      </section>

      {/* ── Tre pelare ─────────────────────────────────── */}
      <section
        id="services"
        className="relative z-20 mx-auto max-w-6xl px-6 pt-4 pb-12"
        aria-label="Tjänster"
      >
        <div className="grid gap-6 md:grid-cols-3">
          {PILLARS.map((pillar) => (
            <article
              key={pillar.id}
              className="glass glow-hover rounded-2xl p-6 shadow-lg md:p-8"
              data-service={pillar.id}
            >
              <pillar.icon className="mb-4 h-8 w-8 text-primary" />
              <p className="mb-1 text-sm font-semibold text-primary">{pillar.question}</p>
              <h2 className="mb-3 text-xl font-bold text-foreground">{pillar.title}</h2>
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                {pillar.description}
              </p>
              <Button variant="outline" size="sm" className="gap-2">
                {pillar.cta} <ArrowRight className="h-3 w-3" />
              </Button>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <p className="max-w-md text-sm text-muted-foreground">
            Skapa ett konto för att spara analyser, följa marknadspriser över tid och få
            tillgång till AI-assistenten.
          </p>
          <Link to="/auth">
            <Button size="sm" className="gap-2">
              Registrera dig kostnadsfritt <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Trust ──────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-6 pb-12" aria-label="Datakällor">
        <div className="glass rounded-2xl p-8 md:p-10">
          <h2 className="mb-6 text-center text-2xl font-bold text-foreground">
            Verifierad marknadsdata
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {TRUST_POINTS.map((point) => (
              <div key={point} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
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
