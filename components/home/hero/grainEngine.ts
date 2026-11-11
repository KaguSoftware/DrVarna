// Grain field engine for hero A ("Raw material becomes the V").
// Plain DOM/canvas code, no React. Ported from the approved prototype (frag-a, hero A).
// One rAF loop, typed arrays, runs only while visible, tab shown, not paused and motion allowed.
import { V_PATH, V_TRANSFORM } from "@/components/site/Logo";

const VW = 323.67;
const VH = 316.83;
const VCX = 161.8;
const VCY = 158.4;
const TAU = Math.PI * 2;
const MAX = 4200;
const MIN = 2400;

type Mask = { W: number; H: number; r: number; a: Uint8Array };

let cachedMask: Mask | null | undefined;

/** Rasterise the real V path once so the grains sample the exact logo. */
function vMask(res: number): Mask | null {
  if (cachedMask !== undefined) return cachedMask;
  cachedMask = null;
  if (typeof Path2D === "undefined") return null;
  const W = Math.ceil(VW * res);
  const H = Math.ceil(VH * res);
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const x = c.getContext("2d", { willReadFrequently: true });
  if (!x) return null;
  const m = /translate\(\s*([-\d.]+)[\s,]+([-\d.]+)/.exec(V_TRANSFORM);
  x.setTransform(res, 0, 0, res, (m ? +m[1] : 0) * res, (m ? +m[2] : 0) * res);
  x.fill(new Path2D(V_PATH), "evenodd");
  const d = x.getImageData(0, 0, W, H).data;
  const a = new Uint8Array(W * H);
  let n = 0;
  for (let i = 0; i < a.length; i++) {
    if (d[i * 4 + 3] > 127) {
      a[i] = 1;
      n++;
    }
  }
  cachedMask = n ? { W, H, r: res, a } : null;
  return cachedMask;
}

function sampleV(M: Mask): [number, number] {
  let u = 0;
  let v = 0;
  let k = 0;
  let x = 0;
  let y = 0;
  do {
    u = Math.random() * VW;
    v = Math.random() * VH;
    x = Math.floor(u * M.r);
    y = Math.floor(v * M.r);
  } while (!(x < M.W && y < M.H && M.a[y * M.W + x]) && ++k < 9999);
  return [u, v];
}

function token(name: string, fallback: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

export type GrainEngine = {
  setPaused(paused: boolean): void;
  setReducedMotion(reduced: boolean): void;
  reform(): void;
  destroy(): void;
};

export function createGrainField(gc: HTMLCanvasElement, reducedAtStart: boolean): GrainEngine | null {
  const M = vMask(1);
  const ctx = gc.getContext("2d");
  if (!M || !ctx) return null;

  let RM = reducedAtStart;
  let n = MAX;
  let t = 0;
  let F = 0;
  let mode = 0;
  let hold = 0.8;
  let next = 1;
  let cw = 1;
  let ch = 1;
  let dp = 1;
  let s = 1;
  let ox = 0;
  let oy = 0;
  let narrow = false;

  const U = new Float32Array(MAX);
  const V = new Float32Array(MAX);
  const X = new Float32Array(MAX);
  const Y = new Float32Array(MAX);
  const VX = new Float32Array(MAX);
  const VY = new Float32Array(MAX);
  const R = new Float32Array(MAX);
  const K = new Float32Array(MAX);
  const C = new Float32Array(MAX);
  const D = new Float32Array(MAX);
  const TH = new Float32Array(MAX);
  const RD = new Float32Array(MAX);
  const OM = new Float32Array(MAX);
  const PH = new Float32Array(MAX);
  const B = new Uint8Array(MAX);

  // Buckets: navy, teal, teal-ink, soft teal, soft navy.
  const ink = token("--color-ink", "#2a3444");
  const teal = token("--color-teal", "#4ba5a6");
  const tink = token("--color-teal-ink", "#2b7a7b");
  const COL = [ink, teal, tink, teal, ink];
  const ALP = [0.9, 1, 1, 0.24, 0.16];

  for (let i = 0; i < MAX; i++) {
    const p = sampleV(M);
    const q = Math.random();
    U[i] = p[0];
    V[i] = p[1];
    B[i] = q < 0.48 ? 1 : q < 0.68 ? 2 : q < 0.9 ? 0 : q < 0.96 ? 3 : 4;
    R[i] = B[i] > 2 ? 1.5 + Math.random() * 1.9 : 0.6 + Math.pow(Math.random(), 2) * 1.5;
    const om = 4.8 + Math.random() * 4;
    K[i] = om * om;
    C[i] = 1.25 * om;
    // About 6% stay loose as dust and never join the V.
    const stray = Math.random() < 0.06;
    D[i] = stray ? 9 : Math.random() * 0.45;
    TH[i] = Math.random() * TAU;
    RD[i] = stray
      ? 0.62 + Math.random() * 0.45
      : Math.min(1.05, Math.sqrt(-2 * Math.log(1 - Math.random() * 0.97)) * 0.38);
    OM[i] = 0.035 + 0.11 * (1 - Math.min(1, RD[i]));
    PH[i] = Math.random() * TAU;
  }

  function layout(): boolean {
    const r = gc.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(r.width * dpr));
    const h = Math.max(1, Math.round(r.height * dpr));
    const ow = cw;
    const oh = ch;
    if (gc.width !== w || gc.height !== h) {
      gc.width = w;
      gc.height = h;
    }
    cw = w;
    ch = h;
    dp = cw / r.width;
    // The wrapper says whether the V sits above the text (stack) or beside it (side).
    narrow = getComputedStyle(gc).getPropertyValue("--grain-layout").trim() === "stack";
    // Grain count scales with area: about 2400 on a phone, 4200 on desktop.
    const area = r.width * r.height;
    n = Math.round(MIN + (MAX - MIN) * Math.min(1, Math.max(0, (area - 150000) / 250000)));
    if (narrow) {
      // Full width V; leave a band at the bottom where the headline tucks under the point.
      s = Math.min((cw * 0.88) / VW, (ch * 0.8) / VH);
      ox = (cw - VW * s) / 2;
      oy = (ch * 0.94 - VH * s) / 2;
    } else {
      s = Math.min((cw * 0.8) / VW, (ch * 0.84) / VH);
      ox = (cw - VW * s) / 2;
      oy = (ch - VH * s) / 2;
    }
    if (ow > 1 && (ow !== cw || oh !== ch)) {
      const fx = cw / ow;
      const fy = ch / oh;
      for (let i = 0; i < MAX; i++) {
        X[i] *= fx;
        Y[i] *= fy;
      }
    }
    return true;
  }

  function place(formed: boolean) {
    const cy = narrow ? oy + VCY * s : ch / 2;
    for (let i = 0; i < MAX; i++) {
      if (formed && D[i] < 1) {
        X[i] = ox + U[i] * s;
        Y[i] = oy + V[i] * s;
      } else {
        X[i] = cw / 2 + Math.cos(TH[i]) * RD[i] * cw * 0.45;
        Y[i] = cy + Math.sin(TH[i]) * RD[i] * ch * 0.41;
      }
      VX[i] = 0;
      VY[i] = 0;
    }
  }

  // Pointer and touch repulsion.
  let PX = -1e9;
  let PY = -1e9;
  let PVX = 0;
  let PVY = 0;
  let PT = 0;
  function ptr(e: PointerEvent) {
    const r = gc.getBoundingClientRect();
    if (!r.width) return;
    const d = gc.width / r.width;
    const x = (e.clientX - r.left) * d;
    const y = (e.clientY - r.top) * d;
    const ts = e.timeStamp;
    if (PX > -1e8 && ts > PT) {
      const k = 1000 / Math.max(8, ts - PT);
      PVX = PVX * 0.5 + (x - PX) * k * 0.5;
      PVY = PVY * 0.5 + (y - PY) * k * 0.5;
    }
    PX = x;
    PY = y;
    PT = ts;
  }
  function off(e: PointerEvent) {
    if (e.pointerType !== "mouse" || e.type !== "pointerup") {
      PX = PY = -1e9;
      PVX = PVY = 0;
    }
  }

  function puff() {
    const cx = ox + VCX * s;
    const cy = oy + VCY * s;
    for (let i = 0; i < n; i++) {
      const dx = X[i] - cx;
      const dy = Y[i] - cy;
      const d = Math.sqrt(dx * dx + dy * dy) + 1;
      const m = (50 + Math.random() * 200) * dp;
      VX[i] += ((dx - dy * 0.45) / d) * m;
      VY[i] += ((dy + dx * 0.45) / d) * m;
    }
  }

  function sim(dt: number) {
    t += dt;
    if (mode === 1) {
      F += dt / 2.9;
      if (F >= 1) {
        F = 1;
        mode = 0;
        hold = 8.5;
        next = -1;
      }
    } else if (mode === -1) {
      F -= dt / 1.9;
      if (F <= 0) {
        F = 0;
        mode = 0;
        hold = 1.7;
        next = 1;
      }
    } else {
      hold -= dt;
      if (hold <= 0) {
        mode = next;
        if (mode === -1) puff();
      }
    }
    const cx = ox + VCX * s;
    const cy = oy + VCY * s;
    const br = 1 + 0.013 * Math.sin(t * 1.2);
    const RX = cw * 0.45;
    const RY = ch * 0.41;
    const CX = cw / 2;
    const CY = narrow ? cy : ch / 2;
    const pr = (narrow ? 58 : 66) * dp;
    const pr2 = pr * pr;
    const str = 9000 * dp;
    const sh = 0.4 * dp;
    const live = PX > -1e8;
    const e = Math.exp(-dt * 9);
    for (let i = 0; i < n; i++) {
      let w = D[i] > 1 ? 0 : (F - D[i]) / 0.55;
      w = w <= 0 ? 0 : w >= 1 ? 1 : w * w * (3 - 2 * w);
      let tx = 0;
      let ty = 0;
      if (w < 1) {
        const a = TH[i] + t * OM[i];
        const r = RD[i] * (1 + 0.14 * Math.sin(3 * TH[i] + t * 0.23));
        tx = CX + Math.cos(a) * r * RX + Math.sin(t * 0.7 + PH[i]) * 5 * dp;
        ty = CY + Math.sin(a) * r * RY + Math.cos(t * 0.55 + PH[i] * 1.7) * 5 * dp;
      }
      if (w > 0) {
        const vx = cx + (ox + U[i] * s - cx) * br + Math.sin(t * 1.6 + PH[i]) * sh;
        const vy = cy + (oy + V[i] * s - cy) * br + Math.cos(t * 1.3 + PH[i]) * sh;
        if (w < 1) {
          tx += (vx - tx) * w;
          ty += (vy - ty) * w;
        } else {
          tx = vx;
          ty = vy;
        }
      }
      let ax = K[i] * (tx - X[i]) - C[i] * VX[i];
      let ay = K[i] * (ty - Y[i]) - C[i] * VY[i];
      if (live) {
        const dx = X[i] - PX;
        const dy = Y[i] - PY;
        const q = dx * dx + dy * dy;
        if (q < pr2) {
          const dd = Math.sqrt(q) + 0.01;
          let f = 1 - dd / pr;
          f *= f;
          ax += (dx / dd) * f * str + PVX * f * 6;
          ay += (dy / dd) * f * str + PVY * f * 6;
        }
      }
      VX[i] += ax * dt;
      VY[i] += ay * dt;
      X[i] += VX[i] * dt;
      Y[i] += VY[i] * dt;
    }
    PVX *= e;
    PVY *= e;
  }

  function draw() {
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cw, ch);
    for (let b = 0; b < 5; b++) {
      ctx.globalAlpha = ALP[b];
      ctx.fillStyle = COL[b];
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        if (B[i] !== b) continue;
        const r = R[i] * dp;
        const x = X[i];
        const y = Y[i];
        if (r < 1.15) ctx.rect(x - r, y - r, r * 2, r * 2);
        else {
          ctx.moveTo(x + r, y);
          ctx.arc(x, y, r, 0, TAU);
        }
      }
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Runner: one rAF loop, gated by visibility, tab state, pause and motion preference.
  const hasIO = typeof IntersectionObserver !== "undefined";
  let vis = !hasIO;
  let paused = false;
  let raf = 0;
  let last = 0;
  let dead = false;
  const on = () => !dead && vis && !paused && !document.hidden && !RM;
  function tick(ts: number) {
    raf = 0;
    if (!on()) return;
    const dt = last ? Math.min(0.05, (ts - last) / 1000) : 1 / 60;
    last = ts;
    sim(dt);
    draw();
    raf = requestAnimationFrame(tick);
  }
  function kick() {
    if (on() && !raf) {
      last = 0;
      raf = requestAnimationFrame(tick);
    }
  }

  const io = hasIO
    ? new IntersectionObserver(
        (es) => {
          vis = es[es.length - 1].isIntersecting;
          kick();
        },
        { rootMargin: "60px" },
      )
    : null;
  io?.observe(gc);
  document.addEventListener("visibilitychange", kick);

  function onResize() {
    if (!layout()) return;
    if (!on()) {
      if (RM) place(true);
      draw();
    }
  }
  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onResize) : null;
  if (ro) ro.observe(gc);
  else window.addEventListener("resize", onResize);

  gc.addEventListener("pointermove", ptr);
  gc.addEventListener("pointerdown", ptr);
  gc.addEventListener("pointerleave", off);
  gc.addEventListener("pointercancel", off);
  gc.addEventListener("pointerup", off);

  layout();
  if (RM) F = 1;
  place(RM);
  draw();
  kick();

  return {
    setPaused(p) {
      paused = p;
      kick();
    },
    setReducedMotion(reduced) {
      if (reduced === RM) return;
      RM = reduced;
      layout();
      if (RM) {
        F = 1;
        place(true);
        draw();
      } else {
        F = 0;
        mode = 0;
        hold = 0.4;
        next = 1;
        place(false);
        draw();
        kick();
      }
    },
    reform() {
      if (RM) return;
      if (F > 0.5 && mode !== -1) {
        mode = -1;
        puff();
      } else mode = 1;
      kick();
    },
    destroy() {
      dead = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      io?.disconnect();
      ro?.disconnect();
      if (!ro) window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", kick);
      gc.removeEventListener("pointermove", ptr);
      gc.removeEventListener("pointerdown", ptr);
      gc.removeEventListener("pointerleave", off);
      gc.removeEventListener("pointercancel", off);
      gc.removeEventListener("pointerup", off);
    },
  };
}
