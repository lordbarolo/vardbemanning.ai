import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/brand/PublicLayout";
import { trackConnectorCta } from "@/lib/analytics";
import { Hero } from "@/components/home/Hero";
import { SearchPanel } from "@/components/home/SearchPanel";
import LonekollenHero from "@/components/LonekollenHero";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "vårdbemanning.ai – vad kan du få i ersättning?" },
      {
        name: "description",
        content:
          "Se vad läkare, sjuksköterskor och barnmorskor kan få i ersättning per timme i varje kommun, beräknat ur SKR:s nationella hyrbemanningsavtal.",
      },
      { property: "og:title", content: "vårdbemanning.ai – vad kan du få i ersättning?" },
      {
        property: "og:description",
        content: "Se vad läkare, sjuksköterskor och barnmorskor kan få i ersättning per timme i varje kommun, beräknat ur SKR:s nationella hyrbemanningsavtal.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});


const TRUST_POINTS = [
  "Priser direkt ur SKR:s nationella hyrbemanningsavtal",
  "Marginal 10–15 % för läkare, 12–18 % för sjuksköterskor, redovisad i varje svar",
  "88 roller, 290 kommuner, tre zoner",
  "Samma svar på sidan och i din AI-assistent",
];

function Index() {
  return (
    <PublicLayout home>
      {/* ── Hero ───────────────────────────────────────── */}
      <Hero title="Vad kan du få i ersättning?" subtitle="För läkare, sjuksköterskor och barnmorskor i bemanning. Välj roll och kommun." rightSlot={<SearchPanel />} />

      {/* ── Lönekollen ─────────────────────────────────── */}
      <LonekollenHero />

      <section className="mx-auto max-w-4xl px-6 py-16" aria-labelledby="connector-heading">
        <h2 id="connector-heading" className="mb-8 text-2xl font-semibold sm:text-3xl">Använd det i din AI-assistent</h2>
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <h3 className="text-xl font-semibold">Claude</h3>
            <ol className="my-4 list-decimal space-y-2 pl-5 text-muted-foreground">
              <li>Lägg till vårdbemanning.ai som en egen koppling i Inställningar.</li>
              <li>Slå på kopplingen i chatten och fråga om roll och kommun.</li>
            </ol>
            <Button asChild variant="outline" className="border-cream bg-cream text-primary-foreground hover:bg-cream/90">
              <Link to="/koppling" onClick={() => trackConnectorCta("claude")}>Koppla Claude</Link>
            </Button>
          </div>
          <div>
            <h3 className="text-xl font-semibold">ChatGPT</h3>
            <ol className="my-4 list-decimal space-y-2 pl-5 text-muted-foreground">
              <li>Aktivera utvecklarläget och lägg till vårdbemanning.ai.</li>
              <li>Aktivera kopplingen i konversationen och fråga om ersättning.</li>
            </ol>
            <Button asChild variant="outline" className="border-cream bg-cream text-primary-foreground hover:bg-cream/90">
              <Link to="/koppling" onClick={() => trackConnectorCta("chatgpt")}>Koppla ChatGPT</Link>
            </Button>
          </div>
        </div>
        <Link to="/koppling" onClick={() => trackConnectorCta("docs")} className="mt-8 inline-block text-cream underline underline-offset-4">Alla instruktioner för AI-kopplingen</Link>
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
