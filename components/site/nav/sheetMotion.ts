// Imperative, interruptible spring driver for the phone menu ("Ink from the button").
// Only transform, opacity and clip-path are written. Runs outside React so no re-render per frame.

export type SheetEls = {
  sheet: HTMLElement;
  bars: [HTMLElement, HTMLElement];
  watermark: HTMLElement | null;
};

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export function createSheetMotion(els: SheetEls, rtl: boolean) {
  const { sheet, bars, watermark } = els;
  const items = Array.from(sheet.querySelectorAll<HTMLElement>("[data-s]"));
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const sg = rtl ? 1 : -1;
  const bd = rtl ? -1 : 1;

  const geom = { cx: 0, cy: 0, R: 0 };
  let p = 0;
  let v = 0;
  let target = 0;
  let raf = 0;
  let last = 0;

  const drift =
    watermark && typeof watermark.animate === "function"
      ? watermark.animate(
          [
            { transform: `translate3d(0,0,0) rotate(${bd * -5}deg)` },
            { transform: `translate3d(${bd * -34}px,-26px,0) rotate(${bd}deg)` },
          ],
          { duration: 70000, iterations: Infinity, direction: "alternate", easing: "ease-in-out" },
        )
      : null;
  drift?.pause();

  function render(done: boolean) {
    const rm = mq.matches;
    const q = clamp(p, 0, 1);
    const current = sheet.querySelector<HTMLElement>("[data-cur]");
    bars[0].style.transform = `translate(0,${-4 * (1 - q)}px) rotate(${45 * q}deg)`;
    bars[1].style.transform = `translate(${-sg * 4 * (1 - q)}px,${4 * (1 - q)}px) rotate(${-45 * q}deg) scaleX(${0.64 + 0.36 * q})`;
    if (rm) {
      sheet.style.clipPath = "none";
      sheet.style.opacity = String(q);
      if (current) current.style.transform = "scaleX(1)";
      for (const it of items) {
        it.style.opacity = "";
        it.style.transform = "";
      }
    } else {
      sheet.style.opacity = "";
      sheet.style.clipPath =
        q >= 1 && p <= 1
          ? "none"
          : `circle(${(geom.R * Math.max(p, 0)).toFixed(1)}px at ${geom.cx.toFixed(1)}px ${geom.cy.toFixed(1)}px)`;
      if (current) current.style.transform = `scaleX(${clamp((p - 0.55) / 0.35, 0, 1)})`;
      for (const it of items) {
        const d = parseFloat(it.dataset.s ?? "0");
        const l = clamp((p - d) / 0.4, 0, 1);
        const ee = p > 1 ? 1 + (p - 1) * 2.5 : easeOut(l);
        it.style.opacity = l >= 1 ? "" : String(Math.min(1, l * 1.6));
        it.style.transform = l >= 1 && p <= 1 ? "" : `translate3d(${(1 - ee) * sg * 40}px,0,0)`;
      }
    }
    if (done && target === 0 && p <= 0) sheet.style.visibility = "hidden";
  }

  function tick(now: number) {
    const dt = Math.min(0.032, (now - last) / 1000);
    last = now;
    // Reduced motion: critically damped and quick (short fade). Otherwise a slight spring overshoot.
    const k = mq.matches ? 600 : 170;
    const c = mq.matches ? 2 * Math.sqrt(600) : 17;
    const h = 1 / 240;
    for (let t = 0; t < dt; t += h) {
      v += (-k * (p - target) - c * v) * h;
      p += v * h;
    }
    if (Math.abs(p - target) < 0.002 && Math.abs(v) < 0.02) {
      p = target;
      v = 0;
      raf = 0;
      render(true);
      return;
    }
    render(false);
    raf = requestAnimationFrame(tick);
  }

  return {
    setGeometry(cx: number, cy: number, W: number, H: number) {
      const dx = Math.max(cx, W - cx);
      const dy = Math.max(cy, H - cy);
      geom.cx = cx;
      geom.cy = cy;
      geom.R = Math.sqrt(dx * dx + dy * dy) / 0.8;
      if (!raf) render(true);
    },
    go(to: 0 | 1) {
      target = to;
      if (to === 1) {
        sheet.style.visibility = "visible";
        if (!mq.matches) drift?.play();
      } else {
        drift?.pause();
      }
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    },
    jump(to: 0 | 1) {
      cancelAnimationFrame(raf);
      raf = 0;
      p = target = to;
      v = 0;
      if (to === 0) drift?.pause();
      if (to === 1) sheet.style.visibility = "visible";
      render(true);
    },
    destroy() {
      cancelAnimationFrame(raf);
      raf = 0;
      drift?.cancel();
    },
  };
}
