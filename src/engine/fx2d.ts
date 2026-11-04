// engine/fx2d.ts — Atmosphere, light, and set elements (2D canvas)
import { E, rng, alpha, shade, seg, circle, ring, rr, linGrad, radGrad, glow } from './core';

export function rain(
  g: CanvasRenderingContext2D,
  t: number,
  o: { seed?: number; count?: number; speed?: number; color?: string; a?: number } = {}
) {
  const { seed = 1, count = 220, speed = 2000, color = '#b8c8ff', a = 0.3 } = o;
  const r = rng(seed);
  g.save();
  g.strokeStyle = alpha(color, a);
  g.lineWidth = 1.4;
  g.lineCap = 'round';
  g.beginPath();
  const dx = 0.14;
  const dy = 0.99;
  for (let i = 0; i < count; i++) {
    const x0 = r() * (E.W + 400) - 200;
    const y0 = r() * E.H;
    const sp = speed * (0.8 + r() * 0.4);
    const L = 40 + r() * 20;
    const y = (y0 + t * sp) % (E.H + 100);
    const x = x0 + y * dx;
    g.moveTo(x, y);
    g.lineTo(x + dx * L, y + dy * L);
  }
  g.stroke();
  g.restore();
}

// Frozen raindrops (time freeze)
export function drops(
  g: CanvasRenderingContext2D,
  t: number,
  o: { seed?: number; count?: number; color?: string; drift?: number } = {}
) {
  const { seed = 2, count = 55, color = '#cfe0ff', drift = 4 } = o;
  const r = rng(seed);
  for (let i = 0; i < count; i++) {
    const x = r() * E.W + Math.sin(t * 0.4 + i) * drift;
    const y = r() * E.H + Math.cos(t * 0.3 + i) * drift;
    const rad = 3 + r() ** 2 * 11;
    g.fillStyle = radGrad(g, x - rad * 0.3, y - rad * 0.3, 0, rad, [
      alpha(color, 0.05),
      alpha(color, 0.2),
      alpha(color, 0.5),
    ]);
    g.beginPath();
    g.arc(x, y, rad, 0, Math.PI * 2);
    g.fill();
    ring(g, x, y, rad, Math.max(0.8, rad * 0.08), alpha(color, 0.6));
    circle(g, x - rad * 0.35, y - rad * 0.35, rad * 0.22, alpha('#ffffff', 0.85));
  }
}

// Floating dust motes
export function dust(
  g: CanvasRenderingContext2D,
  t: number,
  o: { seed?: number; count?: number; color?: string; a?: number } = {}
) {
  const { seed = 3, count = 40, color = '#ffe9d2', a = 0.45 } = o;
  const r = rng(seed);
  g.save();
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < count; i++) {
    const s = 0.4 + r() * 1.2;
    const ph = r() * 6.28;
    const rad = (0.5 + r()) * 2.2;
    const x = ((r() * E.W + Math.sin(t * 0.5 + ph) * 18) % E.W + E.W) % E.W;
    const y = (((r() * E.H - t * 14 * s) % E.H) + E.H) % E.H;
    const al = a * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.7 + ph)));
    g.fillStyle = radGrad(g, x, y, 0, rad * 3, [alpha(color, al), alpha(color, 0)]);
    g.beginPath();
    g.arc(x, y, rad * 3, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();
}

// Sun with halo
export function sun(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color = '#fff6e0',
  glowColor = '#ffd59a',
  glowR = 4
) {
  glow(g, x, y, r * glowR, glowColor, 0.55);
  glow(g, x, y, r * 1.8, '#fff3dc', 0.6);
  circle(g, x, y, r, color);
}

// God rays radiating from a light source
export function godRays(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  o: { count?: number; angle?: number; spread?: number; len?: number; color?: string; a?: number; t?: number } = {}
) {
  const { count = 7, angle = Math.PI / 2, spread = 0.9, len = 1600, color = '#ffd9a0', a = 0.1, t = 0 } = o;
  g.save();
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < count; i++) {
    const ang = angle - spread / 2 + (spread * (i + 0.5)) / count + Math.sin(t * 0.3 + i) * 0.01;
    const w = 0.07;
    g.fillStyle = linGrad(g, x, y, x + Math.cos(ang) * len, y + Math.sin(ang) * len, [
      alpha(color, a),
      alpha(color, 0),
    ]);
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(ang - w) * len, y + Math.sin(ang - w) * len);
    g.lineTo(x + Math.cos(ang + w) * len, y + Math.sin(ang + w) * len);
    g.closePath();
    g.fill();
  }
  g.restore();
}

// Expanding shockwave rings (voice/action reveal)
export function rings(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  o: { count?: number; r0?: number; r1?: number; color?: string; a?: number; speed?: number; w?: number } = {}
) {
  const { count = 3, r0 = 40, r1 = 160, color = '#fff1e6', a = 0.5, speed = 1.4, w = 2 } = o;
  for (let k = 0; k < count; k++) {
    const ph = (t * speed + k / count) % 1;
    ring(g, x, y, r0 + ph * (r1 - r0), w, alpha(color, a * (1 - ph)));
  }
}

// Speed lines radiating from focus point
export function speedLines(
  g: CanvasRenderingContext2D,
  t: number,
  o: { cx?: number; cy?: number; count?: number; color?: string; a?: number; inner?: number; seed?: number } = {}
) {
  const { cx = E.W / 2, cy = E.H / 2, count = 40, color = '#ffffff', a = 0.25, inner = 260, seed = 6 } = o;
  const r = rng(seed);
  g.save();
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < count; i++) {
    const ang = r() * Math.PI * 2;
    const d0 = inner + r() * 180 + ((t * 800 + r() * 400) % 400);
    const L = 80 + r() * 200;
    seg(
      g,
      [
        [cx + Math.cos(ang) * d0, cy + Math.sin(ang) * d0],
        [cx + Math.cos(ang) * (d0 + L), cy + Math.sin(ang) * (d0 + L)],
      ],
      1.5 + r() * 2,
      alpha(color, a * r())
    );
  }
  g.restore();
}

// Skyline buildings with windows
export function skyline(
  g: CanvasRenderingContext2D,
  o: { seed?: number; x?: number; y?: number; w?: number; minH?: number; maxH?: number; color?: string; windowColor?: string; lit?: number } = {}
) {
  const {
    seed = 7,
    x = -200,
    y = E.H * 0.65,
    w = E.W + 400,
    minH = 50,
    maxH = 260,
    color = '#2a2440',
    windowColor = '#ffd59a',
    lit = 0.35,
  } = o;
  const r = rng(seed);
  let cx = x;
  g.fillStyle = color;
  while (cx < x + w) {
    const bw = 30 + r() * 50;
    const bh = minH + r() ** 1.5 * (maxH - minH);
    g.fillStyle = color;
    g.fillRect(cx, y - bh, bw, bh + 2);
    g.fillStyle = windowColor;
    for (let wy = y - bh + 10; wy < y - 10; wy += 14) {
      for (let wx = cx + 6; wx < cx + bw - 6; wx += 12) {
        if (r() < lit) g.fillRect(wx, wy, 4, 6);
      }
    }
    cx += bw + r() * 6;
  }
}

// Window frame with mullions
export function windowFrame(
  g: CanvasRenderingContext2D,
  o: { x: number; y: number; w: number; h: number; cols?: number; rows?: number; frame?: string; bar?: number; blinds?: number },
  drawInside: (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => void
) {
  const { x, y, w, h, cols = 3, rows = 1, frame = '#2b2030', bar = 8, blinds = 0 } = o;
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  drawInside(g, x, y, w, h);
  for (let i = 0; i < blinds; i++) {
    g.fillStyle = alpha(frame, 0.35);
    g.fillRect(x, y + 6 + i * 8, w, 2);
  }
  g.fillStyle = frame;
  for (let i = 1; i < cols; i++) g.fillRect(x + (w * i) / cols - bar / 2, y, bar, h);
  for (let i = 1; i < rows; i++) g.fillRect(x, y + (h * i) / rows - bar / 2, w, bar);
  g.restore();
  g.strokeStyle = frame;
  g.lineWidth = bar;
  g.strokeRect(x, y, w, h);
}

// Floor perspective lines
export function floorLines(g: CanvasRenderingContext2D, y0: number, y1: number, color = 'rgba(0,0,0,.25)', spacing = 0.06) {
  g.strokeStyle = color;
  g.lineWidth = 1.5;
  for (let y = y0 + 8; y < y1; y += Math.max(6, (y - y0) * spacing + 6)) {
    g.beginPath();
    g.moveTo(-E.W, y);
    g.lineTo(E.W * 2, y);
    g.stroke();
  }
}

export function pool(g: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, color = '#ffd59a', a = 0.3) {
  g.save();
  g.globalCompositeOperation = 'lighter';
  g.translate(x, y);
  g.scale(1, ry / rx);
  g.fillStyle = radGrad(g, 0, 0, 0, rx, [alpha(color, a), alpha(color, 0)]);
  g.beginPath();
  g.arc(0, 0, rx, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

export function lensStreak(g: CanvasRenderingContext2D, x: number, y: number, w = E.W, color = '#ffe6cc', a = 0.35, h = 2) {
  g.save();
  g.globalCompositeOperation = 'lighter';
  g.fillStyle = linGrad(g, x - w / 2, 0, x + w / 2, 0, [alpha(color, 0), alpha(color, a), alpha(color, 0)]);
  g.fillRect(x - w / 2, y - h / 2, w, h);
  g.restore();
}

// Sets helpers
export function cafeTable(g: CanvasRenderingContext2D, x: number, GY: number, color = '#1e1418') {
  const top = GY - 150;
  seg(g, [[x, top], [x, GY - 6]], 10, color);
  seg(g, [[x - 50, GY - 4], [x + 50, GY - 4]], 8, color);
  rr(g, x - 130, top - 12, 260, 16, 8);
  g.fillStyle = color;
  g.fill();
  g.fillStyle = 'rgba(255,210,150,.35)';
  g.fillRect(x - 124, top - 12, 248, 3);
  return { top: top - 12 };
}

export function chair(g: CanvasRenderingContext2D, x: number, y: number, s = 1, color = '#2a2230') {
  seg(g, [[x - 30 * s, y], [x - 26 * s, y - 70 * s], [x + 26 * s, y - 70 * s], [x + 30 * s, y]], 6 * s, color);
  seg(g, [[x - 28 * s, y - 70 * s], [x - 32 * s, y - 160 * s]], 7 * s, color);
  rr(g, x - 34 * s, y - 78 * s, 68 * s, 12 * s, 4 * s);
  g.fillStyle = color;
  g.fill();
}

export function cup(g: CanvasRenderingContext2D, x: number, y: number, s = 1, rot = 0) {
  g.save();
  g.translate(x, y);
  g.rotate(rot);
  g.scale(s, s);
  rr(g, -14, -30, 28, 30, 5);
  g.fillStyle = '#f2ece4';
  g.fill();
  seg(g, [[14, -24], [22, -18], [14, -10]], 4, '#f2ece4');
  g.fillStyle = '#4a2a1a';
  g.fillRect(-12, -30, 24, 5);
  g.restore();
}
