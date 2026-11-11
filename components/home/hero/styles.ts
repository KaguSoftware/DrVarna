// Layout CSS for the two hero variants. Rendered through React 19 <style href precedence>,
// so it is hoisted into <head>, deduplicated and present in the static HTML.
// Kept here (not in globals.css) because the layout switch is a compound media query
// that Tailwind utilities cannot express without a custom variant.
// These rules are unlayered, so they win over Tailwind utilities: never put a Tailwind
// utility on these elements for a property set here.

// Side-by-side layout: desktop, or a phone held in landscape (short height).
const SIDE = "(min-width: 1024px), (orientation: landscape) and (min-width: 600px) and (max-height: 560px)";
const SHORT_LANDSCAPE = "(orientation: landscape) and (min-width: 600px) and (max-height: 560px)";

export const grainsCss = `
.hg{--hg-h:calc(100dvh - var(--header-h,72px))}
.hg-in{display:grid;grid-template-columns:minmax(0,1fr);padding-block:0 32px}
.hg-art{--grain-layout:stack;position:relative;order:-1;height:clamp(220px,calc(var(--hg-h) * .6),640px);margin-left:calc(-1 * var(--gutter,20px));margin-right:calc(-1 * var(--gutter-end,20px));margin-bottom:-40px}
.hg-txt{position:relative;z-index:1}
.hg-h1{margin:0 0 20px;max-width:18em;font-size:clamp(26px,6vw + 8px,44px);font-weight:500}
html[lang="en"] .hg-h1{line-height:1.1;letter-spacing:-.02em}
html[lang="fa"] .hg-h1{line-height:1.5}
@media (orientation:portrait) and (max-height:620px){
  .hg-art{height:clamp(200px,calc(var(--hg-h) * .52),640px)}
}
@media ${SIDE}{
  .hg-in{grid-template-columns:minmax(0,5fr) minmax(0,6fr);align-items:center;column-gap:clamp(24px,3vw,56px);min-height:min(var(--hg-h),960px);padding-block:clamp(12px,3vh,40px)}
  .hg-art{--grain-layout:side;order:0;height:clamp(240px,calc(min(var(--hg-h),960px) - 2 * clamp(12px,3vh,40px)),780px);margin:0;margin-inline-end:calc(-1 * var(--gutter-end,20px))}
  .hg-h1{max-width:15em;margin-bottom:32px;font-size:clamp(30px,3.3vw,52px)}
  html[lang="en"] .hg-h1{max-width:13em}
}
@media ${SHORT_LANDSCAPE}{
  .hg-h1{margin-bottom:16px;font-size:clamp(20px,2.6vw,28px)}
}
`;

export const windowCss = `
.hw{--hw-h:calc(100dvh - var(--header-h,72px))}
.hw-in{display:grid;grid-template-columns:minmax(0,1fr);padding-block:0 32px}
.hw-v{order:-1;display:flex;justify-content:center;margin-inline:calc(-1 * var(--gutter,20px) + 10px);margin-bottom:-14px}
.hw-win{display:block;width:100%;height:auto;max-height:calc(var(--hw-h) * .6)}
.hw-txt{position:relative;z-index:1}
.hw-h1{margin:0 0 12px;font-size:clamp(32px,8vw + 4px,56px);font-weight:500}
html[lang="en"] .hw-h1{line-height:1.02;letter-spacing:-.03em}
html[lang="fa"] .hw-h1{line-height:1.38}
.hw-sub{margin:0 0 20px;max-width:28em;font-size:clamp(17px,2vw,20px)}
html[lang="en"] .hw-sub{line-height:1.5}
.hw-d1{animation:hw-drift 140s linear infinite}
.hw-d2{animation:hw-drift 70s linear infinite}
@keyframes hw-drift{to{transform:translateX(-324px)}}
@media ${SIDE}{
  .hw-in{grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:center;column-gap:clamp(24px,3vw,56px);min-height:min(var(--hw-h),960px);padding-block:clamp(16px,4vh,56px)}
  .hw-v{order:0;margin:0}
  .hw-win{max-height:min(calc(var(--hw-h) - 64px),640px)}
  .hw-h1{margin-bottom:16px;font-size:clamp(36px,5vw,76px)}
  .hw-sub{margin-bottom:28px}
}
@media ${SHORT_LANDSCAPE}{
  .hw-h1{font-size:clamp(24px,3.4vw,34px)}
  .hw-sub{margin-bottom:16px;font-size:16px}
}
@media (prefers-reduced-motion:reduce){.hw-d1,.hw-d2{animation:none}}
`;
