// Hero A, "Raw material becomes the V". Server component: all text is in the static HTML;
// only the decorative grain canvas (and its two quiet controls) is a client island.
import type { Locale, Dictionary } from "@/lib/i18n";
import { GrainField } from "./hero/GrainField";
import { HeroCta } from "./hero/HeroCta";
import { grainsCss } from "./hero/styles";

export function HeroGrains({ lang, hero }: { lang: Locale; hero: Dictionary["hero"] }) {
  return (
    <section className="hg" aria-labelledby="hero-title">
      <style href="hero-grains" precedence="default">
        {grainsCss}
      </style>
      <div className="hg-in container-site">
        <div className="hg-txt">
          <h1 id="hero-title" className="hg-h1 text-ink">
            {hero.title}
          </h1>
          <HeroCta lang={lang} cta={hero.cta} secondary={hero.secondary} />
        </div>
        <div className="hg-art">
          <GrainField />
        </div>
      </div>
    </section>
  );
}
