// Hero B, "Giant V as a window". Ready to swap in for HeroGrains with the same props.
// Server component, no client JS: the scene drifts with a slow CSS animation
// (stopped under prefers-reduced-motion). The V is never mirrored in RTL.
import type { ReactElement } from "react";
import type { Locale, Dictionary } from "@/lib/i18n";
import { V_PATH, V_TRANSFORM, V_VIEWBOX } from "@/components/site/Logo";
import { HeroCta } from "./hero/HeroCta";
import { windowCss } from "./hero/styles";

const PAPER_TEAL = "#E7F2F2";
const NAVY = "#2A3444";
const TEAL = "#4BA5A6";

/** Far rack of blister packs, one 324 wide tile (repeated once for a seamless drift). */
function BackTile() {
  const out: ReactElement[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      const bx = c * 81 + (r % 2 ? 40 : 6);
      const by = 18 + r * 96;
      out.push(<rect key={`b${r}-${c}`} x={bx} y={by} width="64" height="40" rx="6" fill={NAVY} />);
      for (let gy = 0; gy < 2; gy++) {
        for (let gx = 0; gx < 4; gx++) {
          out.push(
            <circle
              key={`c${r}-${c}-${gy}-${gx}`}
              cx={bx + 11 + gx * 14}
              cy={by + 12 + gy * 16}
              r="5"
              fill="none"
              stroke={PAPER_TEAL}
              strokeOpacity=".22"
            />,
          );
        }
      }
    }
  }
  return <g id="hw-back">{out}</g>;
}

/** Front shelves of vials, one 324 wide tile. */
function FrontTile() {
  const out: ReactElement[] = [];
  [118, 214, 310].forEach((sy, si) => {
    out.push(<rect key={`s${si}`} x="0" y={sy} width="324" height="3" fill={TEAL} fillOpacity=".35" />);
    for (let n = 0; n < 9; n++) {
      const vx = n * 36 + (si % 2 ? 18 : 4);
      const h = 46 + ((n * 7 + si * 3) % 3) * 6;
      const w = 22;
      const vy = sy - h;
      const lv = 0.35 + ((n * 5 + si) % 4) * 0.1;
      out.push(
        <g key={`v${si}-${n}`}>
          <rect
            x={vx}
            y={vy + 10}
            width={w}
            height={h - 10}
            rx="5"
            fill={PAPER_TEAL}
            fillOpacity=".1"
            stroke={PAPER_TEAL}
            strokeOpacity=".45"
            strokeWidth=".8"
          />
          <rect
            x={vx + 2}
            y={vy + 10 + (h - 10) * (1 - lv)}
            width={w - 4}
            height={(h - 10) * lv - 2}
            rx="3"
            fill={TEAL}
            fillOpacity=".85"
          />
          <rect x={vx + 5} y={vy + 5} width={w - 10} height="6" fill={PAPER_TEAL} fillOpacity=".35" />
          <rect x={vx + 2} y={vy} width={w - 4} height="7" rx="2" fill={PAPER_TEAL} fillOpacity=".9" />
        </g>,
      );
    }
  });
  return <g id="hw-front">{out}</g>;
}

export function HeroWindow({ lang, hero }: { lang: Locale; hero: Dictionary["hero"] }) {
  return (
    <section className="hw" aria-labelledby="hero-title">
      <style href="hero-window" precedence="default">
        {windowCss}
      </style>
      <div className="hw-in container-site">
        <div className="hw-txt">
          <h1 id="hero-title" className="hw-h1 text-ink">
            {hero.titleShort}
          </h1>
          <p className="hw-sub text-muted">{hero.sub}</p>
          <HeroCta lang={lang} cta={hero.cta} secondary={hero.secondary} />
        </div>
        <div className="hw-v">
          <svg className="hw-win" viewBox={V_VIEWBOX} aria-hidden="true" focusable="false">
            <defs>
              <clipPath id="hw-clip" clipPathUnits="userSpaceOnUse">
                <path d={V_PATH} transform={V_TRANSFORM} clipRule="evenodd" />
              </clipPath>
              <linearGradient id="hw-light" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={PAPER_TEAL} stopOpacity=".16" />
                <stop offset=".6" stopColor={PAPER_TEAL} stopOpacity="0" />
              </linearGradient>
              <BackTile />
              <FrontTile />
            </defs>
            <g clipPath="url(#hw-clip)">
              <rect width="324" height="317" fill="#1D2531" />
              <g className="hw-d1">
                <use href="#hw-back" />
                <use href="#hw-back" x="324" />
              </g>
              <g className="hw-d2">
                <use href="#hw-front" />
                <use href="#hw-front" x="324" />
              </g>
              <rect width="324" height="317" fill="url(#hw-light)" />
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
