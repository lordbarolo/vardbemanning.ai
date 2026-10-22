import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

import { PublicLayout } from "@/components/brand/PublicLayout";
import { Hero } from "@/components/home/Hero";
import { SearchPanel } from "@/components/home/SearchPanel";
import LonekollenHero from "@/components/LonekollenHero";

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

function Index() {
  return (
    <PublicLayout>
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

    </PublicLayout>
  );
}
