// engine/rig2d.ts — Stick-figure character rig, poses, outfits, and expressions
import { E, clamp, lerp, seg, circle, ring, alpha, shade, mix, rr, poly, ease, Camera } from './core';
import { CharacterOutfit } from '../types/studio';

export interface RigPose {
  head: [number, number];
  sh: [number, number];
  hip: [number, number];
  eF: [number, number]; // Near (front) elbow
  hF: [number, number]; // Near hand
  eB: [number, number]; // Far (back) elbow
  hB: [number, number]; // Far hand
  kF: [number, number]; // Near knee
  fF: [number, number]; // Near foot
  kB: [number, number]; // Far knee
  fB: [number, number]; // Far foot
}

export const POSES: Record<string, RigPose> = {
  stand: { head: [3, -208], sh: [0, -174], hip: [0, -100], eF: [9, -137], hF: [13, -101], eB: [-7, -136], hB: [-9, -100], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] },
  relaxed: { head: [4, -207], sh: [1, -173], hip: [0, -100], eF: [12, -138], hF: [20, -106], eB: [-8, -137], hB: [-14, -104], kF: [8, -50], fF: [10, 0], kB: [-4, -50], fB: [-12, 0] },
  talk: { head: [5, -208], sh: [1, -174], hip: [0, -100], eF: [22, -132], hF: [42, -146], eB: [-7, -136], hB: [-9, -100], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] },
  explain: { head: [5, -208], sh: [1, -174], hip: [0, -100], eF: [24, -136], hF: [46, -156], eB: [16, -134], hB: [34, -148], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] },
  point: { head: [5, -208], sh: [1, -174], hip: [0, -100], eF: [34, -170], hF: [68, -172], eB: [-7, -136], hB: [-9, -100], kF: [6, -50], fF: [6, 0], kB: [-6, -50], fB: [-12, 0] },
  pointUp: { head: [4, -209], sh: [1, -174], hip: [0, -100], eF: [18, -206], hF: [22, -246], eB: [-7, -136], hB: [-9, -100], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] },
  wave: { head: [4, -209], sh: [1, -174], hip: [0, -100], eF: [28, -196], hF: [36, -236], eB: [-7, -136], hB: [-9, -100], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] },
  cheer: { head: [3, -212], sh: [0, -176], hip: [0, -100], eF: [22, -206], hF: [36, -246], eB: [-20, -206], hB: [-32, -246], kF: [10, -50], fF: [16, 0], kB: [-10, -50], fB: [-16, 0] },
  crossArms: { head: [2, -208], sh: [0, -174], hip: [0, -100], eF: [16, -142], hF: [-8, -150], eB: [10, -144], hB: [14, -152], kF: [6, -50], fF: [6, 0], kB: [-6, -50], fB: [-12, 0] },
  think: { head: [6, -206], sh: [1, -173], hip: [0, -100], eF: [24, -148], hF: [16, -192], eB: [16, -134], hB: [6, -140], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] },
  shrug: { head: [3, -206], sh: [0, -172], hip: [0, -100], eF: [26, -156], hF: [40, -176], eB: [-24, -156], hB: [-38, -176], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] },
  holdFront: { head: [5, -207], sh: [1, -173], hip: [0, -100], eF: [22, -140], hF: [36, -152], eB: [16, -142], hB: [30, -154], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] },
  phone: { head: [6, -204], sh: [1, -172], hip: [0, -100], eF: [20, -138], hF: [28, -166], eB: [-7, -136], hB: [-9, -100], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] },
  sad: { head: [12, -192], sh: [6, -166], hip: [0, -100], eF: [10, -132], hF: [12, -98], eB: [-2, -132], hB: [-2, -98], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] },
  ready: { head: [12, -182], sh: [6, -148], hip: [0, -80], eF: [34, -132], hF: [56, -146], eB: [-26, -132], hB: [-46, -146], kF: [26, -44], fF: [22, 0], kB: [-24, -44], fB: [-24, 0] },
  sit: { head: [4, -180], sh: [1, -146], hip: [0, -72], eF: [16, -110], hF: [38, -84], eB: [10, -110], hB: [30, -84], kF: [44, -74], fF: [46, 0], kB: [40, -72], fB: [38, 0] },
  sitBack: { head: [-8, -176], sh: [-6, -144], hip: [0, -72], eF: [2, -108], hF: [26, -86], eB: [-14, -110], hB: [-24, -80], kF: [44, -78], fF: [54, -2], kB: [40, -76], fB: [44, 0] },
  kick: { head: [-4, -206], sh: [-6, -172], hip: [0, -100], eF: [8, -140], hF: [24, -124], eB: [-24, -140], hB: [-42, -128], kF: [36, -78], fF: [66, -70], kB: [-4, -50], fB: [-8, 0] },
  jump: { head: [4, -232], sh: [1, -198], hip: [0, -124], eF: [24, -226], hF: [32, -266], eB: [-18, -226], hB: [-26, -266], kF: [16, -82], fF: [6, -48], kB: [-12, -84], fB: [-22, -50] },
};

export function mixPoint(a: [number, number], b: [number, number], k: number): [number, number] {
  return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
}

export function blendPose(a: RigPose | string, b: RigPose | string, k: number): RigPose {
  const pA = typeof a === 'string' ? POSES[a] || POSES.stand : a;
  const pB = typeof b === 'string' ? POSES[b] || POSES.stand : b;
  const t = ease.inOut(k);
  const res: Partial<RigPose> = {};
  for (const key of Object.keys(pA) as (keyof RigPose)[]) {
    res[key] = mixPoint(pA[key], pB[key], t);
  }
  return res as RigPose;
}

export function breathe(p: RigPose, t: number, amt = 1, seed = 0): RigPose {
  const b = Math.sin(t * 2.1 + seed) * 1.6 * amt;
  const s = Math.sin(t * 0.9 + seed * 2) * 1.2 * amt;
  const q: RigPose = { ...p };
  for (const k of ['head', 'sh', 'eF', 'hF', 'eB', 'hB'] as const) {
    q[k] = [p[k][0] + s * (k === 'head' ? 1.2 : 0.6), p[k][1] + b];
  }
  return q;
}

export function posesAt(t: number, keys: [number, string | RigPose][], blend = 0.35): RigPose {
  let cur = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [ti, pi] = keys[i];
    if (t < ti) break;
    const k = clamp((t - ti) / blend);
    cur = k >= 1 ? pi : blendPose(cur, pi, k);
    if (k < 1) return typeof cur === 'string' ? POSES[cur] || POSES.stand : cur;
  }
  return typeof cur === 'string' ? POSES[cur] || POSES.stand : cur;
}

// Expressions library
export type Expression =
  | 'neutral'
  | 'smile'
  | 'happy'
  | 'joy'
  | 'surprised'
  | 'shocked'
  | 'scared'
  | 'worried'
  | 'angry'
  | 'determined'
  | 'sad'
  | 'smirk'
  | 'thinking';

export interface FaceOptions {
  expr?: Expression;
  talk?: number;
  blink?: boolean;
  look?: [number, number];
  front?: boolean;
  color?: string;
  facing?: number;
}

export function drawFace(
  g: CanvasRenderingContext2D,
  hx: number,
  hy: number,
  r: number,
  o: FaceOptions = {}
) {
  const expr = o.expr || 'neutral';
  const col = o.color || E.style.feature;
  const fx = hx + (o.front ? 0 : r * 0.34);
  const fy = hy - r * 0.08;
  const look = o.look || [0, 0];
  const eyeX = o.front ? [fx - r * 0.34, fx + r * 0.34] : [fx - r * 0.26, fx + r * 0.32];
  const ey = fy - r * 0.08;

  g.save();
  g.lineCap = 'round';
  g.lineJoin = 'round';

  eyeX.forEach((x, i) => {
    const s = o.front ? 1 : i === 0 ? 0.88 : 1;
    if (o.blink) {
      seg(g, [[x - r * 0.12 * s, ey], [x + r * 0.12 * s, ey]], r * 0.08, col);
      return;
    }
    switch (expr) {
      case 'happy':
      case 'joy':
        g.strokeStyle = col;
        g.lineWidth = r * 0.09;
        g.beginPath();
        g.arc(x, ey + r * 0.05, r * 0.13 * s, Math.PI * 1.1, Math.PI * 1.9);
        g.stroke();
        break;
      case 'shocked':
      case 'surprised':
        ring(g, x, ey, r * 0.2 * s, r * 0.085, col);
        circle(g, x + look[0] * r * 0.06, ey + look[1] * r * 0.06, r * 0.075 * s, col);
        break;
      default:
        circle(g, x + look[0] * r * 0.05, ey + look[1] * r * 0.05, r * 0.125 * s, col);
    }
  });

  // Brows
  const by = ey - r * 0.3;
  const bw = r * 0.15;
  const brow = (x: number, a: number) => seg(g, [[x - bw, by + a], [x + bw, by - a]], r * 0.075, col);
  if (expr === 'worried' || expr === 'scared' || expr === 'sad') {
    brow(eyeX[0], -r * 0.06);
    brow(eyeX[1], r * 0.06);
  }
  if (expr === 'angry' || expr === 'determined') {
    brow(eyeX[0], r * 0.08);
    brow(eyeX[1], -r * 0.08);
  }
  if (expr === 'surprised' || expr === 'shocked') {
    eyeX.forEach((x) => {
      g.strokeStyle = col;
      g.lineWidth = r * 0.07;
      g.beginPath();
      g.arc(x, by + r * 0.12, r * 0.15, Math.PI * 1.2, Math.PI * 1.8);
      g.stroke();
    });
  }

  // Mouth
  const mx = fx + (o.front ? 0 : r * 0.04);
  const my = fy + r * 0.42;
  const talk = o.talk || 0;
  if (talk > 0.05) {
    g.fillStyle = col;
    g.beginPath();
    g.ellipse(mx, my, r * 0.16, r * (0.05 + 0.2 * talk), 0, 0, Math.PI * 2);
    g.fill();
  } else {
    switch (expr) {
      case 'smile':
      case 'happy':
      case 'joy':
        g.strokeStyle = col;
        g.lineWidth = r * 0.09;
        g.beginPath();
        g.arc(mx, my - r * 0.18, r * 0.25, 0.35, Math.PI - 0.35);
        g.stroke();
        break;
      case 'shocked':
        ring(g, mx, my + r * 0.04, r * 0.15, r * 0.08, col);
        break;
      case 'surprised':
        g.fillStyle = col;
        g.beginPath();
        g.ellipse(mx, my, r * 0.11, r * 0.15, 0, 0, Math.PI * 2);
        g.fill();
        break;
      case 'sad':
        g.strokeStyle = col;
        g.lineWidth = r * 0.085;
        g.beginPath();
        g.arc(mx, my + r * 0.2, r * 0.2, Math.PI + 0.5, Math.PI * 2 - 0.5);
        g.stroke();
        break;
      case 'smirk':
        g.strokeStyle = col;
        g.lineWidth = r * 0.085;
        g.beginPath();
        g.moveTo(mx - r * 0.16, my);
        g.quadraticCurveTo(mx + r * 0.05, my + r * 0.06, mx + r * 0.22, my - r * 0.1);
        g.stroke();
        break;
      default:
        seg(g, [[mx - r * 0.14, my], [mx + r * 0.14, my]], r * 0.08, col);
    }
  }

  g.restore();
}

// Headwear drawing
function drawHeadwear(
  g: CanvasRenderingContext2D,
  of: CharacterOutfit,
  hx: number,
  hy: number,
  r: number
) {
  const c = of.headColor || '#f2c21a';
  const dark = shade(c, -0.25);
  const hi = shade(c, 0.35);

  switch (of.head) {
    case 'cap':
    case 'capBack': {
      const back = of.head === 'capBack' ? -1 : 1;
      g.fillStyle = c;
      g.beginPath();
      g.ellipse(hx - 1, hy - r * 0.32, r * 1.04, r * 0.82, 0, Math.PI, Math.PI * 2);
      g.fill();
      seg(g, [[hx + back * r * 0.25, hy - r * 0.34], [hx + back * r * 1.55, hy - r * 0.26]], r * 0.26, dark);
      g.strokeStyle = alpha(hi, 0.8);
      g.lineWidth = r * 0.08;
      g.beginPath();
      g.ellipse(hx - r * 0.1, hy - r * 0.5, r * 0.6, r * 0.42, 0, Math.PI * 1.15, Math.PI * 1.55);
      g.stroke();
      break;
    }
    case 'beanie': {
      g.fillStyle = c;
      g.beginPath();
      g.ellipse(hx - 1, hy - r * 0.18, r * 1.06, r * 1.0, 0, Math.PI, Math.PI * 2);
      g.fill();
      rr(g, hx - r * 1.08, hy - r * 0.34, r * 2.16, r * 0.34, r * 0.14);
      g.fillStyle = dark;
      g.fill();
      circle(g, hx - r * 0.1, hy - r * 1.2, r * 0.3, hi);
      break;
    }
    case 'fedora': {
      g.fillStyle = c;
      g.beginPath();
      g.ellipse(hx, hy - r * 0.55, r * 1.8, r * 0.3, 0, 0, Math.PI * 2);
      g.fill();
      rr(g, hx - r * 0.78, hy - r * 1.45, r * 1.56, r * 0.95, r * 0.25);
      g.fill();
      g.fillStyle = dark;
      g.fillRect(hx - r * 0.78, hy - r * 0.78, r * 1.56, r * 0.2);
      break;
    }
    default:
      break;
  }
}

export interface DrawFigureOptions {
  x: number;
  y: number;
  s?: number;
  facing?: number; // 1 = right, -1 = left
  pose?: RigPose;
  rot?: number;
  outfit?: CharacterOutfit;
  expr?: Expression;
  talk?: number;
  blink?: boolean;
  look?: [number, number];
  rim?: { color: string; dir: [number, number]; w?: number } | false;
  dim?: boolean;
  alpha?: number;
  prop?: string | { type: string; rot?: number };
  shadow?: boolean;
}

export function drawFigure(g: CanvasRenderingContext2D, o: DrawFigureOptions) {
  const ink = E.style.ink;
  const far = E.style.inkFar;
  const p = o.pose || POSES.stand;
  const s = (o.s ?? 1) * (o.outfit?.kid ? 0.72 : 1);
  const f = o.facing ?? 1;
  const of = o.outfit || {};
  const rim =
    o.rim === false
      ? null
      : {
          dir: [-0.8, -0.5] as [number, number],
          w: E.style.rimWidth,
          color: '#ffc68a',
          ...(typeof o.rim === 'object' ? o.rim : {}),
        };

  g.save();
  if (o.alpha != null) g.globalAlpha *= o.alpha;

  // Contact shadow on ground
  if (o.shadow !== false && !o.rot) {
    g.fillStyle = 'rgba(0,0,0,.28)';
    g.beginPath();
    g.ellipse(o.x, o.y + 2, 34 * s, 6 * s, 0, 0, Math.PI * 2);
    g.fill();
  }

  const tf = (dx = 0, dy = 0) => {
    g.translate(o.x + dx, o.y + dy);
    g.scale(f * s, s);
    if (o.rot) {
      g.translate(p.hip[0], p.hip[1]);
      g.rotate(o.rot);
      g.translate(-p.hip[0], -p.hip[1]);
    }
  };

  // Rim light silhouette pass
  if (rim) {
    g.save();
    tf(rim.dir[0] * (rim.w || 4), rim.dir[1] * (rim.w || 4));
    renderParts(g, p, of, rim.color, rim.color, true);
    g.restore();
  }

  // Main body pass
  g.save();
  tf();
  renderParts(g, p, of, o.dim ? mix(ink, far, 0.6) : ink, far, false);

  // Face
  drawFace(g, p.head[0], p.head[1], 26, {
    expr: o.expr,
    talk: o.talk,
    blink: o.blink,
    look: o.look,
  });

  // Eyewear
  if (of.face === 'glasses') {
    const c = E.style.feature;
    g.strokeStyle = c;
    g.lineWidth = 2.4;
    for (const dx of [-6.5, 10]) {
      g.beginPath();
      g.arc(p.head[0] + 9 + dx, p.head[1] - 4, 7, 0, Math.PI * 2);
      g.stroke();
    }
    seg(g, [[p.head[0] + 9.5, p.head[1] - 4], [p.head[0] + 12.5, p.head[1] - 4]], 2, c);
  }

  // Props
  if (o.prop) {
    const propType = typeof o.prop === 'string' ? o.prop : o.prop.type;
    const h = p.hF;
    if (propType === 'phone') {
      rr(g, h[0] - 2, h[1] - 22, 14, 24, 3);
      g.fillStyle = ink;
      g.fill();
      g.fillStyle = '#9fd8ff';
      g.fillRect(h[0], h[1] - 20, 10, 18);
    } else if (propType === 'cup') {
      g.fillStyle = '#f2ece4';
      rr(g, h[0] - 2, h[1] - 18, 14, 18, 2);
      g.fill();
    } else if (propType === 'pointer') {
      seg(g, [h, [h[0] + 70, h[1] - 50]], 3, '#d8d0c0');
    }
  }

  g.restore();
  g.restore();
}

function renderParts(
  g: CanvasRenderingContext2D,
  p: RigPose,
  of: CharacterOutfit,
  ink: string,
  far: string,
  sil: boolean
) {
  const L = 12.5;
  const A = 11;
  const T = 15;
  const HR = 26;

  // Far leg + arm
  seg(g, [p.hip, p.kB, p.fB, [p.fB[0] + 12, p.fB[1]]], L - 1, sil ? ink : of.legs ? shade(of.legs, -0.35) : far);
  seg(g, [p.sh, p.eB, p.hB], A - 1, sil ? ink : far);

  // Torso
  seg(g, [p.sh, p.hip], T, ink);

  // Clothes (Hoodie / Labcoat / Jersey)
  if (of.top && of.top !== 'none') {
    const c = sil ? ink : of.top === 'labcoat' ? '#ebe7f0' : of.color || '#d64a33';
    const [sx, sy] = p.sh;
    const [hx, hy] = p.hip;
    if (of.top === 'hoodie' || of.top === 'tshirt' || of.top === 'jersey') {
      g.fillStyle = c;
      g.beginPath();
      g.moveTo(sx - 15, sy - 2);
      g.lineTo(sx + 15, sy - 2);
      g.lineTo(hx + 15, hy + 8);
      g.lineTo(hx - 15, hy + 8);
      g.closePath();
      g.fill();
      if (!sil && of.top === 'hoodie') {
        g.fillStyle = shade(c, -0.25);
        g.fillRect(hx - 15, hy + 2, 30, 6);
      }
    } else if (of.top === 'labcoat') {
      g.fillStyle = c;
      g.beginPath();
      g.moveTo(sx - 15, sy - 5);
      g.lineTo(sx + 15, sy - 5);
      g.lineTo(hx + 24, hy + 44);
      g.lineTo(hx - 22, hy + 44);
      g.closePath();
      g.fill();
    }
  }

  // Near leg
  seg(g, [p.hip, p.kF, p.fF, [p.fF[0] + 13, p.fF[1]]], L, sil ? ink : of.legs || ink);

  // Near arm
  seg(g, [p.sh, p.eF, p.hF], A, ink);
  if (!sil && of.top && of.top !== 'none') {
    const c = of.top === 'labcoat' ? '#f3f0f6' : of.color || '#d64a33';
    seg(g, [p.sh, p.eF, [lerp(p.eF[0], p.hF[0], 0.72), lerp(p.eF[1], p.hF[1], 0.72)]], 16.5, c);
  }

  // Head
  circle(g, p.head[0], p.head[1], HR, ink);
  if (of.head && of.head !== 'none') {
    drawHeadwear(g, of, p.head[0], p.head[1], HR);
  }
}

// Giant close-up head
export function bigFace(
  g: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  o: {
    outfit?: CharacterOutfit;
    expr?: Expression;
    talk?: number;
    blink?: boolean;
    look?: [number, number];
    rimColor?: string;
    rimSide?: number;
    tilt?: number;
  } = {}
) {
  const ink = E.style.ink;
  const of = o.outfit || {};
  const rc = o.rimColor || '#ffc68a';
  const side = o.rimSide ?? -1;

  g.save();
  g.translate(cx, cy);
  if (o.tilt) g.rotate(o.tilt);

  // Shoulders
  const top = of.top || 'none';
  const cc = top === 'labcoat' ? '#ebe7f0' : of.color || ink;
  g.fillStyle = top === 'none' ? ink : cc;
  g.beginPath();
  g.ellipse(0, r * 1.65, r * 1.25, r * 0.85, 0, Math.PI, Math.PI * 2);
  g.fill();

  // Rim crescent
  g.save();
  g.beginPath();
  g.arc(0, 0, r + r * 0.06, 0, Math.PI * 2);
  g.arc(side * r * 0.07, r * 0.02, r, 0, Math.PI * 2, true);
  g.fillStyle = rc;
  g.fill('evenodd');
  g.restore();

  // Head circle
  circle(g, 0, 0, r, ink);
  if (of.head && of.head !== 'none') {
    drawHeadwear(g, of, 0, 0, r);
  }

  drawFace(g, 0, 0, r, {
    expr: o.expr,
    talk: o.talk,
    blink: o.blink,
    look: o.look,
    front: true,
  });

  g.restore();
}
