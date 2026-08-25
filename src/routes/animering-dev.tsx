import { createFileRoute, Link } from "@tanstack/react-router";

import LonekollenHero from "@/components/LonekollenHero";
import { Hero } from "@/components/home/Hero";
import { SearchPanel } from "@/components/home/SearchPanel";

export const Route = createFileRoute("/animering-dev")({
  head: () => ({
    meta: [
      { title: "Animering – testvy | Vårdbemanning.ai" },
      {
        name: "description",
        content:
          "Intern testvy för Lönekollen-animationen som övergång från mörk hero till ljusare sektioner.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Animering – testvy | Vårdbemanning.ai" },
      {
        property: "og:description",
        content: "Intern testvy för animationens övergång från mörkt till ljust.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnimeringDev,
});

function AnimeringDev() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero som referens för skarven uppåt */}
      <Hero rightSlot={<SearchPanel />} />

      <section aria-label="Lönekollen-animation" className="anim-stage">
        <div className="anim-stage__glow" aria-hidden="true" />
        <div className="anim-stage__inner">
          <div className="anim-stage__frame">
            <LonekollenHero />
          </div>
        </div>
      </section>

      {/* Platshållare för kommande ljusa sektioner */}
      <section
        className="px-6 py-24"
        style={{ background: "hsl(250 40% 96%)" }}
        aria-label="Kommande ljus sektion"
      >
        <div className="mx-auto max-w-3xl text-center">
          <h1
            className="text-3xl font-bold md:text-4xl"
            style={{ color: "hsl(260 40% 12%)" }}
          >
            Här börjar det ljusa
          </h1>
          <p className="mt-4 text-base" style={{ color: "hsl(258 15% 40%)" }}>
            Platshållare för de sektioner som kommer under animeringen. Animationen
            ligger inramad i samma mörka miljö som hero.
          </p>
          <Link
            to="/"
            className="mt-8 inline-block text-sm underline"
            style={{ color: "hsl(256 70% 45%)" }}
          >
            Tillbaka till startsidan
          </Link>
        </div>
      </section>
    </div>
  );
}
