// engine/ui2d.ts — On-screen graphics: titles, data cards, counters, blueprints, badges
import { E, clamp, lerp, prog, ease, alpha, seg, circle, rr, poly, drawText, measureText, glow, FONTS } from './core';
import { RigPose, POSES } from './rig2d';

const fadeIO = (t: number, dur: number, inT = 0.35, outT = 0.35) =>
  clamp(Math.min(t / inT, (dur - t) / outT));

// Glowing Title Card
export function titleCard(
  g: CanvasRenderingContext2D,
  t: number,
  o: { lines?: string[]; sub?: string | null; dur?: number; y?: number } = {}
) {
  const { lines = ['WHAT IF', 'TITLE GOES HERE?'], sub = null, dur = 4, y = E.H / 2 } = o;
  const ui = E.style.ui;
  const a = fadeIO(t, dur, 0.5, 0.5);
  if (a <= 0) return;

  const s = 1 + 0.02 * t;
  const big = E.V(96, 88);
  const small = E.V(52, 48);

  g.save();
  g.globalAlpha *= a;
  g.translate(E.W / 2, y);
  g.scale(s, s);

  const fit = (str: string, size: number) =>
    Math.min(size, (E.W * 0.86) / Math.max(1, measureText(g, str, size) / size));
  const sizes = lines.map((ln, i) => fit(ln, i === lines.length - 1 ? big : small));
  const gaps = sizes.slice(1).map((s2, i) => (sizes[i] + s2) * 0.62);
  const totalH = gaps.reduce((acc, b) => acc + b, 0);

  let yy = -totalH / 2 - (sub ? big * 0.45 : 0);
  lines.forEach((ln, i) => {
    const isBig = i === lines.length - 1;
    drawText(g, ln, 0, yy, {
      size: sizes[i],
      color: isBig ? ui.gold : ui.cream,
      glow: 32,
      glowColor: 'rgba(255,120,40,.85)',
      spacing: isBig ? 3 : 4,
    });
    yy += gaps[i] ?? sizes[i] * 0.9;
  });

  if (sub) {
    g.fillStyle = alpha(ui.cream, 0.55);
    g.fillRect(-E.W * 0.22, yy - big * 0.32, E.W * 0.44, 3);
    drawText(g, sub, 0, yy + big * 0.32, {
      size: small * 1.05,
      color: ui.accent,
      glow: 24,
      glowColor: 'rgba(255,80,60,.7)',
      spacing: 3,
    });
  }
  g.restore();
}

// Corner Badge (e.g. "100x" or "10x FASTER")
export function badge(
  g: CanvasRenderingContext2D,
  o: { str?: string; x?: number; y?: number; color?: string; size?: number; a?: number } = {}
) {
  const {
    str = '100x',
    x = E.W - E.V(90, 70),
    y = E.V(110, 150),
    color = E.style.ui.gold,
    size = E.V(38, 44),
    a = 1,
  } = o;
  drawText(g, str, x, y, {
    size,
    color,
    glow: 18,
    glowColor: alpha(color, 0.6),
    align: 'right',
    alpha: a,
    font: FONTS.ui,
    weight: 900,
  });
}

// Readout readout (e.g. "NORMAL: 0.25 s")
export function readout(
  g: CanvasRenderingContext2D,
  o: { label?: string | null; value?: string; x?: number; y?: number; color?: string; size?: number; a?: number; align?: CanvasTextAlign } = {}
) {
  const {
    label = null,
    value = '0.20 s',
    x = 200,
    y = E.H - 200,
    color = E.style.ui.gold,
    size = E.V(46, 52),
    a = 1,
    align = 'left',
  } = o;
  const ls = size * 0.42;
  const lw = label ? measureText(g, label, ls, FONTS.ui, 900) + 18 : 0;
  const vw = measureText(g, value, size, FONTS.ui, 900);
  const tot = lw + vw;
  const xx = align === 'center' ? x - tot / 2 : align === 'right' ? x - tot : x;

  g.save();
  g.globalAlpha *= a;
  if (label) {
    drawText(g, label, xx, y + size * 0.08, {
      size: ls,
      color: alpha(E.style.ui.cream, 0.8),
      font: FONTS.ui,
      weight: 900,
      align: 'left',
      spacing: 2,
    });
  }
  drawText(g, value, xx + lw, y, {
    size,
    color,
    glow: 16,
    glowColor: alpha(color, 0.6),
    font: FONTS.ui,
    weight: 900,
    align: 'left',
  });
  g.restore();
}

// Blueprint grid background
export function blueprint(g: CanvasRenderingContext2D, o: { grid?: number; a?: number } = {}) {
  const { grid = 60, a = 0.07 } = o;
  const ui = E.style.ui;
  g.fillStyle = ui.bpBg;
  g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  g.strokeStyle = alpha(ui.blueprint, a);
  g.lineWidth = 1;
  for (let x = 0; x <= E.W; x += grid) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, E.H);
    g.stroke();
  }
  for (let y = 0; y <= E.H; y += grid) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(E.W, y);
    g.stroke();
  }
}

// Line stick figure for blueprint diagrams
export function lineFigure(
  g: CanvasRenderingContext2D,
  o: { x: number; y: number; s?: number; pose?: RigPose; color?: string; facing?: number }
) {
  const { x, y, s = 1, pose = POSES.stand, color = '#e8f0ff', facing = 1 } = o;
  const p = pose;
  g.save();
  g.translate(x, y);
  g.scale(s * facing, s);
  g.strokeStyle = color;
  g.lineWidth = 5;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  const L = (pts: [number, number][]) => {
    g.beginPath();
    g.moveTo(pts[0][0], pts[0][1]);
    pts.slice(1).forEach((q) => g.lineTo(q[0], q[1]));
    g.stroke();
  };
  L([p.sh, p.hip]);
  L([p.hip, p.kF, p.fF]);
  L([p.hip, p.kB, p.fB]);
  L([p.sh, p.eF, p.hF]);
  L([p.sh, p.eB, p.hB]);
  g.beginPath();
  g.arc(p.head[0], p.head[1], 22, 0, Math.PI * 2);
  g.stroke();
  g.restore();
}
