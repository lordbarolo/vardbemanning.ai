import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type HeroProps = {
  title?: string;
  subtitle?: string;
  badge?: string;
  badgeHref?: string;
  cta?: string;
  ctaHref?: string;
  rightSlot?: ReactNode;
};

export function Hero({
  title = "Har du rätt lön?",
  subtitle =
    "Se uppdaterade ersättningar för läkare och sjuksköterskor inom bemanning. Sök utifrån din roll och uppdragsort.",
  badge = "Smarta verktyg för läkare och sjuksköterskor",
  badgeHref = "#services",
  cta = "Se din ersättning",
  ctaHref = "#compensation-check",
  rightSlot,
}: HeroProps) {
  return (
    <section className="hero-package" aria-labelledby="hero-heading">
      <div className="hero-package__spotlight" aria-hidden="true" />
      <div className="hero-package__beam" aria-hidden="true" />

      <div className="hero-package__inner">
        <div className="hero-package__copy">
          <a href={badgeHref} className="hero-package__badge">
            <span className="hero-package__badge-inner">
              <span>{badge}</span>
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </span>
          </a>

          <h1 id="hero-heading" className="hero-package__title">
            {title}
          </h1>
          <p className="hero-package__subtitle">{subtitle}</p>

          <Button asChild size="lg" className="hero-package__cta">
            <a href={ctaHref}>
              {cta}
              <ArrowRight aria-hidden="true" />
            </a>
          </Button>
        </div>

        <div id="compensation-check" className="hero-package__right">
          {rightSlot}
        </div>
      </div>
    </section>
  );
}