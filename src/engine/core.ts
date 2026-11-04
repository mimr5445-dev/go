// engine/core.ts — Procedural 2D canvas engine, color math, camera layers, and styles
import { VisualStyleId, AspectRatio } from '../types/studio';

export interface MoodPalette {
  sky: string[];
  ambient: string;
  key: string;
  rim: string;
  wall: string;
  floor: string;
  dark: string;
  practical: string;
  grass: string;
  road: string;
  fog: string;
}

export const BASE_MOODS: Record<string, MoodPalette> = {
  day: {
    sky: ['#8fb0d8', '#cfdcea', '#efe3d2'],
    ambient: '#6f7d96',
    key: '#fff3dc',
    rim: '#fff1d6',
    wall: '#8d8496',
    floor: '#5f5866',
    dark: '#2f2a36',
    practical: '#ffe2a8',
    grass: '#4f8a55',
    road: '#5d5a66',
    fog: '#dfe4f0',
  },
  golden: {
    sky: ['#6b5a8e', '#e89a6a', '#f9d49c'],
    ambient: '#4a3a50',
    key: '#ffcf8f',
    rim: '#ffc68a',
    wall: '#5a3a34',
    floor: '#45302a',
    dark: '#2a1814',
    practical: '#ffe7b0',
    grass: '#4d6b3c',
    road: '#4a3c40',
    fog: '#f0c49a',
  },
  dusk: {
    sky: ['#3d3360', '#8a5a86', '#e8956b', '#f7cf98'],
    ambient: '#3b2b3d',
    key: '#ffc68a',
    rim: '#ffc68a',
    wall: '#4a3646',
    floor: '#3d2c38',
    dark: '#231a27',
    practical: '#ffd59a',
    grass: '#3d5a48',
    road: '#3a3040',
    fog: '#c08a8a',
  },
  night: {
    sky: ['#0b1028', '#1d2550', '#3a3570'],
    ambient: '#1e2444',
    key: '#c9d4ff',
    rim: '#a9b8ff',
    wall: '#262a46',
    floor: '#1b1e33',
    dark: '#0f1122',
    practical: '#ffb860',
    grass: '#22433a',
    road: '#24263a',
    fog: '#3a4270',
  },
  storm: {
    sky: ['#141a33', '#2a3358', '#3d4670'],
    ambient: '#232a48',
    key: '#dfe6ff',
    rim: '#cfd9ff',
    wall: '#2b3150',
    floor: '#1c2238',
    dark: '#0d1020',
    practical: '#bcd0ff',
    grass: '#25483e',
    road: '#232838',
    fog: '#4a5580',
  },
  interiorWarm: {
    sky: ['#c98a74', '#f2b585', '#f7cf98'],
    ambient: '#4a3646',
    key: '#ffd59a',
    rim: '#ffcf8f',
    wall: '#4f3a40',
    floor: '#3a2a2e',
    dark: '#21171c',
    practical: '#ffd28a',
    grass: '#3d5a48',
    road: '#3a3040',
    fog: '#a87a70',
  },
  interiorCool: {
    sky: ['#2a3560', '#5a6aa0'],
    ambient: '#2a2c48',
    key: '#cbd6ff',
    rim: '#b8c6ff',
    wall: '#2e3150',
    floor: '#22243a',
    dark: '#121426',
    practical: '#9fe0ff',
    grass: '#22433a',
    road: '#24263a',
    fog: '#4a5080',
  },
  void: {
    sky: ['#0a0e1a', '#121a2e'],
    ambient: '#151c30',
    key: '#ffffff',
    rim: '#8fb8e8',
    wall: '#121a2e',
    floor: '#0d1322',
    dark: '#070a12',
    practical: '#ffd47e',
    grass: '#1d3a33',
    road: '#151a28',
    fog: '#1d2740',
  },
};

export const UI_COLORS = {
  card: 'rgba(18,28,48,.94)',
  cardLine: 'rgba(150,180,230,.25)',
  text: '#9fb6d8',
  sub: '#6f84a6',
  accent: '#ff6f61',
  gold: '#ffd47e',
  cream: '#fff1dc',
  blueprint: '#8fb8e8',
  bpBg: '#0b1324',
  good: '#5fd39a',
};

export interface StyleDef {
  name: string;
  desc: string;
  ink: string;
  inkFar: string;
  feature: string;
  rimWidth: number;
  ui: typeof UI_COLORS;
  grade: {
    contrast: number;
    sat: number;
    lift: [number, number, number];
    gamma: [number, number, number];
    gain: [number, number, number];
    vignette: number;
    grain: number;
    bloom: number;
    tint?: [string, GlobalCompositeOperation, number];
  };
  moods?: Partial<Record<string, Partial<MoodPalette>>>;
}

export const STYLES: Record<VisualStyleId, StyleDef> = {
  dusk: {
    name: 'Cinematic Dusk',
    desc: 'Reference look: mauve-purple shadows, amber key light, cream rim light, 2:1 letterbox.',
    ink: '#0e0b12',
    inkFar: '#2b2333',
    feature: '#f4efe6',
    rimWidth: 4,
    ui: UI_COLORS,
    grade: { contrast: 1.0, sat: 1.0, lift: [0, 0, 0], gamma: [1, 1, 1], gain: [1, 1, 1], vignette: 0.55, grain: 0.055, bloom: 0.55 },
    moods: {},
  },
  midnight: {
    name: 'Midnight Blue',
    desc: 'Cold navy world, blue-white rim light, sodium-orange practical lights, rain-friendly.',
    ink: '#0a0c16',
    inkFar: '#232a40',
    feature: '#eef3ff',
    rimWidth: 4,
    ui: { ...UI_COLORS, accent: '#ff8a5c', gold: '#ffc66e' },
    grade: { contrast: 1.06, sat: 0.8, lift: [0.0, 0.025, 0.09], gamma: [0.92, 0.98, 1.08], gain: [0.84, 0.95, 1.15], vignette: 0.65, grain: 0.06, bloom: 0.7 },
    moods: {
      dusk: { sky: ['#141a3a', '#2c3470', '#5a5aa0', '#c08aa0'], key: '#d8dcff', rim: '#b8c8ff', wall: '#2a2c4a', floor: '#1e2036' },
      golden: { rim: '#ffd6a8' },
      interiorWarm: { wall: '#3a3448', sky: ['#5a5a90', '#c09ab0'] },
    },
  },
  golden: {
    name: 'Golden Hour',
    desc: 'Warm orange-and-teal daylight, big sun glows, brighter mid-tones, warm cream rim.',
    ink: '#120c0a',
    inkFar: '#3a2a26',
    feature: '#fff6e6',
    rimWidth: 4.5,
    ui: { ...UI_COLORS, card: 'rgba(30,26,40,.92)', accent: '#ff7a4a' },
    grade: { contrast: 1.04, sat: 1.18, lift: [0.035, 0.015, 0.0], gamma: [1.1, 1.04, 0.94], gain: [1.12, 1.02, 0.8], vignette: 0.45, grain: 0.045, bloom: 0.75 },
    moods: {
      night: { sky: ['#14183a', '#2e2c5a', '#6a4a6a'], rim: '#ffcf9a' },
      dusk: { sky: ['#4a3a6a', '#d0786a', '#f2a46a', '#fbd8a0'] },
    },
  },
  neon: {
    name: 'Neon Noir',
    desc: 'Deep blacks, magenta + teal two-tone rim lights, glowing signage, high contrast.',
    ink: '#07060c',
    inkFar: '#1e1830',
    feature: '#f6f0ff',
    rimWidth: 4,
    ui: { ...UI_COLORS, card: 'rgba(14,10,28,.94)', cardLine: 'rgba(200,120,255,.3)', text: '#c9a8ff', accent: '#ff4fa3', gold: '#5ff2e8', blueprint: '#7fe8ff' },
    grade: { contrast: 1.15, sat: 1.4, lift: [0.01, 0.0, 0.04], gamma: [1.0, 0.9, 1.06], gain: [1.12, 0.86, 1.18], vignette: 0.7, grain: 0.06, bloom: 0.9 },
    moods: {
      dusk: { sky: ['#120a2a', '#3a1a5a', '#a03a8a', '#ff7a9a'], rim: '#ff6ac8', key: '#ff8ad0', practical: '#5ff2e8' },
      night: { sky: ['#06061a', '#140f3a', '#2a1a5a'], rim: '#5ff2e8', practical: '#ff4fa3' },
      interiorWarm: { rim: '#ff7ab8', practical: '#5ff2e8', wall: '#2a1e3a' },
      day: { rim: '#7ff0ff' },
    },
  },
  storybook: {
    name: 'Soft Storybook',
    desc: 'Lighter pastel palette, lower contrast, lavender shadows, gentle paper grain.',
    ink: '#1a1622',
    inkFar: '#4a4258',
    feature: '#fffaf0',
    rimWidth: 5,
    ui: { ...UI_COLORS, card: 'rgba(40,36,60,.9)', accent: '#ff8a7a', gold: '#ffd98a' },
    grade: { contrast: 0.92, sat: 0.92, lift: [0.07, 0.055, 0.085], gamma: [1.12, 1.1, 1.06], gain: [1.06, 1.03, 0.98], vignette: 0.3, grain: 0.07, bloom: 0.45 },
    moods: {
      night: { sky: ['#2a2f5a', '#4a4f80', '#6a6aa0'], wall: '#3e4266' },
      dusk: { sky: ['#6a5a90', '#c08aa8', '#f2b0a0', '#fbe0b8'] },
    },
  },
};

// Global Runtime State (similar to E in engine/core.js)
export class EngineRuntime {
  W = 1920;
  H = 1080;
  PX = 1;
  fps = 24;
  vertical = false;
  styleId: VisualStyleId = 'dusk';
  style: StyleDef = STYLES.dusk;

  setAspect(aspect: AspectRatio) {
    this.vertical = aspect === '9:16';
    this.W = this.vertical ? 1080 : 1920;
    this.H = this.vertical ? 1920 : 1080;
  }

  setStyle(id: VisualStyleId) {
    this.styleId = STYLES[id] ? id : 'dusk';
    this.style = STYLES[this.styleId];
  }

  getMood(name: string): MoodPalette {
    const base = BASE_MOODS[name] || BASE_MOODS.dusk;
    const overrides = this.style.moods?.[name] || {};
    return { ...base, ...overrides };
  }

  V<T>(landscapeVal: T, verticalVal: T): T {
    return this.vertical ? verticalVal : landscapeVal;
  }
}

export const E = new EngineRuntime();
export const mood = (name = 'dusk') => E.getMood(name);

// Math / timing utilities
export const clamp = (x: number, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));

export const ease = {
  linear: (x: number) => clamp(x),
  in: (x: number) => clamp(x) ** 3,
  out: (x: number) => 1 - (1 - clamp(x)) ** 3,
  inOut: (x: number) => {
    const c = clamp(x);
    return c < 0.5 ? 4 * c ** 3 : 1 - (-2 * c + 2) ** 3 / 2;
  },
  sine: (x: number) => -(Math.cos(Math.PI * clamp(x)) - 1) / 2,
  outBack: (x: number) => {
    const c = clamp(x);
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * (c - 1) ** 3 + c1 * (c - 1) ** 2;
  },
  outElastic: (x: number) => {
    const c = clamp(x);
    return c === 0 || c === 1 ? c : 2 ** (-10 * c) * Math.sin((c * 10 - 0.75) * (2 * Math.PI) / 3) + 1;
  },
};

export function rng(seed = 1) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

export function noise(x: number, seed = 0) {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return lerp(hash(i + seed * 57), hash(i + 1 + seed * 57), u) * 2 - 1;
}

export const shake = (t: number, amp = 4, freq = 1.3, seed = 3): [number, number] => [
  noise(t * freq, seed) * amp,
  noise(t * freq, seed + 9) * amp,
];

// Color helpers
export function rgb(c: string | number[]): [number, number, number, number] {
  if (Array.isArray(c)) return [c[0], c[1], c[2], c[3] ?? 1];
  if (c.startsWith('rgb')) {
    const m = c.match(/[\d.]+/g)?.map(Number) || [255, 255, 255, 1];
    return [m[0], m[1], m[2], m[3] ?? 1];
  }
  let h = c.slice(1);
  if (h.length === 3) h = [...h].map((x) => x + x).join('');
  const n = parseInt(h.slice(0, 6), 16);
  return [n >> 16, (n >> 8) & 255, n & 255, h.length > 6 ? parseInt(h.slice(6), 16) / 255 : 1];
}

export const css = ([r, g, b, a = 1]: [number, number, number, number?]) =>
  `rgba(${r | 0},${g | 0},${b | 0},${+a.toFixed(3)})`;

export const mix = (c1: string, c2: string, k: number) => {
  const a = rgb(c1);
  const b = rgb(c2);
  return css([
    lerp(a[0], b[0], k),
    lerp(a[1], b[1], k),
    lerp(a[2], b[2], k),
    lerp(a[3], b[3] ?? 1, k),
  ]);
};

export const alpha = (c: string, a: number) => {
  const x = rgb(c);
  return css([x[0], x[1], x[2], a]);
};

export const shade = (c: string, k: number) =>
  k < 0 ? mix(c, '#000000', -k) : mix(c, '#ffffff', k);

// Canvas 2D Primitives
export function rr(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, w / 2, h / 2);
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

export function seg(
  g: CanvasRenderingContext2D,
  pts: [number, number][],
  w: number,
  col: string,
  cap: CanvasLineCap = 'round'
) {
  if (pts.length < 2) return;
  g.strokeStyle = col;
  g.lineWidth = w;
  g.lineCap = cap;
  g.lineJoin = 'round';
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.stroke();
}

export function poly(g: CanvasRenderingContext2D, pts: [number, number][], fill: string) {
  if (pts.length < 2) return;
  g.fillStyle = fill;
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.closePath();
  g.fill();
}

export function circle(g: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string) {
  g.fillStyle = fill;
  g.beginPath();
  g.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
  g.fill();
}

export function ring(g: CanvasRenderingContext2D, x: number, y: number, r: number, w: number, col: string) {
  g.strokeStyle = col;
  g.lineWidth = w;
  g.beginPath();
  g.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
  g.stroke();
}

export function linGrad(
  g: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  stops: (string | [number, string])[]
) {
  const gr = g.createLinearGradient(x0, y0, x1, y1);
  stops.forEach((c, i) =>
    Array.isArray(c) ? gr.addColorStop(c[0], c[1]) : gr.addColorStop(i / Math.max(1, stops.length - 1), c)
  );
  return gr;
}

export function radGrad(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  r0: number,
  r1: number,
  stops: (string | [number, string])[]
) {
  const gr = g.createRadialGradient(x, y, r0, x, y, r1);
  stops.forEach((c, i) =>
    Array.isArray(c) ? gr.addColorStop(c[0], c[1]) : gr.addColorStop(i / Math.max(1, stops.length - 1), c)
  );
  return gr;
}

export function glow(g: CanvasRenderingContext2D, x: number, y: number, r: number, col: string, a = 1) {
  g.save();
  g.globalCompositeOperation = 'lighter';
  g.fillStyle = radGrad(g, x, y, 0, r, [alpha(col, a), alpha(col, a * 0.35), alpha(col, 0)]);
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

export function veil(g: CanvasRenderingContext2D, color = '#000', a = 0.3, op: GlobalCompositeOperation = 'source-over') {
  g.save();
  g.globalCompositeOperation = op;
  g.fillStyle = alpha(color, a);
  g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  g.restore();
}

export function backdrop(g: CanvasRenderingContext2D, colors: string[], area: [number, number, number, number] = [-E.W, -E.H, E.W * 3, E.H * 3]) {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, colors);
  g.fillRect(...area);
}

export const FONTS = {
  title: 'Fredoka, sans-serif',
  ui: 'Nunito, sans-serif',
  serif: 'Playfair Display, serif',
  mono: 'JetBrains Mono, monospace',
};

export interface TextOptions {
  size?: number;
  font?: string;
  weight?: number | string;
  color?: string;
  align?: CanvasTextAlign;
  base?: CanvasTextBaseline;
  glow?: number;
  glowColor?: string;
  spacing?: number;
  alpha?: number;
  stroke?: number;
  strokeColor?: string;
  italic?: boolean;
}

export function drawText(g: CanvasRenderingContext2D, str: string, x: number, y: number, o: TextOptions = {}) {
  const {
    size = 48,
    font = FONTS.title,
    weight = 700,
    color = '#fff',
    align = 'center',
    base = 'middle',
    glow: gl = 0,
    glowColor = 'rgba(255,140,60,.8)',
    spacing = 0,
    alpha: a = 1,
    stroke = 0,
    strokeColor = '#000',
    italic = false,
  } = o;
  g.save();
  g.globalAlpha *= a;
  g.font = `${italic ? 'italic ' : ''}${weight} ${size}px ${font}`;
  g.textAlign = align;
  g.textBaseline = base;
  if ('letterSpacing' in g) {
    (g as unknown as { letterSpacing: string }).letterSpacing = `${spacing}px`;
  }
  if (stroke) {
    g.lineJoin = 'round';
    g.lineWidth = stroke;
    g.strokeStyle = strokeColor;
    g.strokeText(str, x, y);
  }
  if (gl) {
    g.shadowColor = glowColor;
    g.shadowBlur = gl;
  }
  g.fillStyle = color;
  g.fillText(str, x, y);
  g.restore();
}

export function measureText(
  g: CanvasRenderingContext2D,
  str: string,
  size: number,
  font = FONTS.title,
  weight: number | string = 700
) {
  g.save();
  g.font = `${weight} ${size}px ${font}`;
  const w = g.measureText(str).width;
  g.restore();
  return w;
}

// Camera parallax
export interface Camera {
  x?: number;
  y?: number;
  z?: number; // zoom (1.0 = normal)
  r?: number; // roll (radians)
}

export function layer(g: CanvasRenderingContext2D, cam: Camera, depth: number, fn: (g: CanvasRenderingContext2D) => void) {
  g.save();
  const z = 1 + ((cam.z ?? 1) - 1) * depth;
  g.translate(E.W / 2, E.H / 2);
  if (cam.r) g.rotate(cam.r * Math.min(1, depth));
  g.scale(z, z);
  g.translate(-E.W / 2 - (cam.x || 0) * depth, -E.H / 2 - (cam.y || 0) * depth);
  fn(g);
  g.restore();
}

// Simple blur layer emulator
export function blurLayer(
  g: CanvasRenderingContext2D,
  amount: number,
  fn: (g: CanvasRenderingContext2D) => void,
  cam?: Camera,
  depth = 1
) {
  if (amount <= 0.5) {
    cam ? layer(g, cam, depth, fn) : fn(g);
    return;
  }
  g.save();
  g.filter = `blur(${amount * 0.75}px)`;
  cam ? layer(g, cam, depth, fn) : fn(g);
  g.filter = 'none';
  g.restore();
}
