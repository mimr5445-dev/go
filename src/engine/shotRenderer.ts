// engine/shotRenderer.ts — Renders any shot in real-time onto an HTML5 Canvas
import { Shot } from '../types/studio';
import { E, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, linGrad, backdrop, circle, ring, seg, rr, glow, alpha, shade, mix, drawText, FONTS } from './core';
import { drawFigure, POSES, posesAt, breathe, bigFace } from './rig2d';
import * as FX from './fx2d';
import * as UI from './ui2d';
import { CAST_DEFINITIONS } from '../data/defaultProject';

export function renderShotToCanvas(
  ctx: CanvasRenderingContext2D,
  shot: Shot,
  lt: number, // local shot time (seconds from shot.start)
  globalT: number,
  glCanvas?: HTMLCanvasElement | null
) {
  const dur = shot.end - shot.start;
  const p = clamp(lt / dur);
  const W = E.W;
  const H = E.H;

  // Clear canvas
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Set logical scaling from E.W/E.H to canvas pixel size
  const scale = ctx.canvas.width / W;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);

  // Default black stage
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, W, H);

  // Route drawing by shot ID or set type
  if (shot.id === 's001') {
    renderS001(ctx, lt, dur);
  } else if (shot.id === 's002') {
    renderS002(ctx, lt, dur);
  } else if (shot.id === 's003') {
    renderS003(ctx, lt, dur);
  } else if (shot.id === 's004') {
    renderS004(ctx, lt, dur);
  } else if (shot.id === 's005') {
    renderS005(ctx, lt, dur);
  } else if (shot.id === 's006') {
    renderS006(ctx, lt, dur);
  } else if (shot.id === 's007') {
    renderS007(ctx, lt, dur);
  } else if (shot.id === 's008' && glCanvas) {
    // 3D Orbit shot
    ctx.drawImage(glCanvas, 0, 0, W, H);
  } else if (shot.id === 's009') {
    renderS009(ctx, lt, dur, globalT);
  } else if (shot.id === 's010') {
    renderS010(ctx, lt, dur);
  } else if (shot.id === 's011') {
    renderS011(ctx, lt, dur);
  } else if (shot.id === 's012') {
    renderS012(ctx, lt, dur);
  } else if (shot.id === 's013') {
    renderS013(ctx, lt, dur);
  } else if (shot.id === 's014') {
    renderS014(ctx, lt, dur);
  } else {
    // Generic procedural render based on set and scene description
    renderGenericShot(ctx, shot, lt, dur);
  }

  // Draw Letterbox bars if requested
  const barType = shot.bars ?? E.V('wide', 'none');
  const barHeight =
    barType === 'scope'
      ? E.V(138, 170)
      : barType === 'wide'
      ? E.V(60, 0)
      : barType === 'thin'
      ? E.V(30, 40)
      : 0;

  if (barHeight > 0) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, barHeight);
    ctx.fillRect(0, H - barHeight, W, barHeight);
  }

  // Film grain overlay emulation
  if (E.style.grade.grain > 0) {
    ctx.save();
    ctx.globalAlpha = E.style.grade.grain * 0.4;
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 20; i++) {
      const rx = (Math.sin(globalT * 31 + i) * 0.5 + 0.5) * W;
      const ry = (Math.cos(globalT * 47 + i * 2) * 0.5 + 0.5) * H;
      ctx.fillRect(rx, ry, 2, 2);
    }
    ctx.restore();
  }

  ctx.restore();
}

// Cafe background scene helper
function drawCafeBackground(ctx: CanvasRenderingContext2D, t: number, cam: { z?: number; x?: number; y?: number }) {
  const M = mood('golden');
  const GY = E.H * E.V(0.82, 0.68);
  const CX = E.W / 2;

  // Sky layer (depth 0.12)
  layer(ctx, cam, 0.12, (g) => {
    backdrop(g, M.sky);
    FX.sun(g, CX + E.V(620, 300), GY - E.V(560, 1000), 64, '#fff3dc', M.key, 5);
    FX.skyline(g, {
      x: -E.W,
      y: GY - E.V(420, 700),
      w: E.W * 3,
      minH: 80,
      maxH: E.V(260, 420),
      color: mix(M.sky[1], M.dark, 0.75),
      windowColor: alpha(M.practical, 0.5),
      lit: 0.15,
      seed: 8,
    });
  });

  // Cafe facade layer (depth 0.55)
  layer(ctx, cam, 0.55, (g) => {
    const top = GY - E.V(560, 860);
    const left = CX - 1500;
    const w = 3000;
    g.fillStyle = linGrad(g, 0, top, 0, GY, [shade(M.wall, 0.06), M.wall, shade(M.wall, -0.6)]);
    g.fillRect(left, top, w, GY - top + 4);

    // Awning stripes
    const ay = GY - E.V(430, 560);
    const ah = 54;
    for (let x = left, k = 0; x < left + w; x += 56, k++) {
      g.fillStyle = k % 2 ? '#c9b8a4' : '#8f3328';
      g.fillRect(x, ay - ah, 56, ah);
      g.beginPath();
      g.arc(x + 28, ay, 28, 0, Math.PI);
      g.fill();
    }

    // Windows
    for (const i of [-2, -1, 1, 2]) {
      const ww = 210;
      const wh = E.V(250, 300);
      const wx = CX + i * 320 - ww / 2;
      const wy = ay + 46;
      FX.windowFrame(g, { x: wx, y: wy, w: ww, h: wh, cols: 2, rows: 1 }, (ig, x, y, iw, ih) => {
        ig.fillStyle = linGrad(ig, 0, y, 0, y + ih, [M.practical, shade(M.practical, -0.5)]);
        ig.fillRect(x, y, iw, ih);
        circle(ig, x + iw * 0.5, y + 34, 9, '#fff3d6');
        glow(ig, x + iw * 0.5, y + 34, 70, '#fff3d6', 0.5);
      });
      glow(g, wx + ww / 2, wy + wh / 2, 220, M.practical, 0.15);
    }
  });

  // Sidewalk (depth 0.9)
  layer(ctx, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 400, [shade(M.floor, -0.1), shade(M.dark, -0.2)]);
    g.fillRect(-E.W, GY, E.W * 3, E.H * 2);
    FX.floorLines(g, GY, GY + 500, 'rgba(0,0,0,.25)', 0.08);
  });

  return { GY, CX, M };
}

// Fly drawing helper
function drawFly(g: CanvasRenderingContext2D, x: number, y: number, t: number, s = 1) {
  for (let i = 1; i <= 6; i++) {
    circle(g, x + i * 9 * s, y + Math.sin((t - i * 0.03) * 22) * 6 * s, 1.6 * s, 'rgba(20,16,24,.35)');
  }
  circle(g, x, y, 5 * s, '#120e16');
  const wf = Math.abs(Math.sin(t * 90));
  g.fillStyle = 'rgba(230,240,255,.55)';
  g.beginPath();
  g.ellipse(x - 2 * s, y - 6 * s, 3 * s, 7 * s * wf + 1, -0.4, 0, 7);
  g.fill();
  g.beginPath();
  g.ellipse(x + 3 * s, y - 6 * s, 3 * s, 7 * s * wf + 1, 0.4, 0, 7);
  g.fill();
}

// Shot s001: Cafe wide, fly passes Max
function renderS001(g: CanvasRenderingContext2D, t: number, dur: number) {
  const cam = { z: 1 + 0.06 * ease.inOut(t / dur), x: -30 * ease.inOut(t / dur) };
  const { GY, CX, M } = drawCafeBackground(g, t, cam);
  const s = E.V(1.6, 1.7);
  const maxPos = CX - E.V(210, 190);
  const jakePos = CX + E.V(210, 190);

  layer(g, cam, 1.0, (cg) => {
    FX.chair(cg, maxPos, GY, s, '#24181e');
    FX.chair(cg, jakePos, GY, s, '#24181e');
    const tb = FX.cafeTable(cg, CX, GY);
    FX.cup(cg, CX + 60, tb.top, 1.2);

    const fX = E.W + 60 - t * E.V(700, 480);
    const fY = E.H * E.V(0.42, 0.5) + Math.sin(t * 5) * 30;
    const look: [number, number] = [clamp((fX - maxPos) / 300, -1, 1), clamp((fY - (GY - 180 * s)) / 300, -1, 1)];

    drawFigure(cg, {
      x: maxPos,
      y: GY,
      s,
      facing: 1,
      outfit: CAST_DEFINITIONS.MAX.outfit,
      pose: breathe(POSES.sit, t),
      expr: t > 1.6 ? 'surprised' : 'neutral',
      look,
      rim: { color: M.rim, dir: [0, -1] },
      shadow: false,
    });

    drawFigure(cg, {
      x: jakePos,
      y: GY,
      s,
      facing: -1,
      outfit: CAST_DEFINITIONS.JAKE.outfit,
      pose: breathe(POSES.phone, t, 1, 2),
      expr: 'neutral',
      prop: 'phone',
      rim: { color: M.rim, dir: [0, -1] },
      shadow: false,
    });

    drawFly(cg, fX, fY, t, 1.4);
  });

  FX.dust(g, t, { count: 35, color: '#ffe2bd' });
}

// Shot s002: BigFace Max determined focus
function renderS002(g: CanvasRenderingContext2D, t: number, dur: number) {
  blurLayer(g, 12, (bg) => drawCafeBackground(bg, t, { z: 1.5, x: -150 }));
  veil(g, '#120a10', 0.4);
  const r = E.V(300, 330) * (1 + 0.04 * (t / dur));
  const fx = lerp(E.W * 0.9, E.W * 0.15, ease.inOut(prog(t, 0.1, 1.3)));
  bigFace(g, E.W / 2, E.H * E.V(0.6, 0.55), r, {
    outfit: CAST_DEFINITIONS.MAX.outfit,
    expr: 'determined',
    look: [clamp((fx - E.W / 2) / 400, -1, 1), -0.2],
    rimColor: '#ffc68a',
    rimSide: -1,
  });
  drawFly(g, fx, E.H * 0.4, t, 3.5);
}

// Shot s003: Hand snatches fly
function renderS003(g: CanvasRenderingContext2D, t: number, dur: number) {
  blurLayer(g, 14, (bg) => drawCafeBackground(bg, t, { z: 1.7, x: 200 }));
  veil(g, '#120a10', 0.35);

  const snap = 0.5;
  const closed = t > snap;
  const k = ease.out(prog(t, 0, snap));
  const fxy: [number, number] = [E.W * 0.48, E.H * 0.45];
  const hx = lerp(E.W * 0.95, fxy[0] + 20, k);
  const hy = lerp(E.H * 0.75, fxy[1] + 10, k);

  if (!closed) {
    drawFly(g, fxy[0], fxy[1], t, 2.2);
  }

  // Draw catching arm
  const s = E.V(1.4, 1.2);
  const ink = '#0e0b12';
  seg(g, [[hx + 40 * s, hy + 20 * s], [E.W + 400, hy + 260 * s]], 70 * s, ink);
  seg(g, [[hx + 150 * s, hy + 70 * s], [E.W + 400, hy + 260 * s]], 96 * s, CAST_DEFINITIONS.MAX.outfit.color || '#d64a33');

  if (closed) {
    circle(g, hx, hy, 46 * s, ink);
    for (let i = 0; i < 4; i++) {
      circle(g, hx - 34 * s + i * 4 * s, hy - 30 * s + i * 20 * s, 15 * s, ink);
    }
    FX.rings(g, fxy[0], fxy[1], t - snap, { count: 3, r0: 60, r1: 380, color: '#fff3e0' });
    FX.speedLines(g, t, { cx: fxy[0], cy: fxy[1], count: 36, a: 0.3 });
    UI.readout(g, { label: 'REACTION:', value: '0.025 s', x: E.V(140, 90), y: E.H - E.V(170, 520) });
  } else {
    circle(g, hx + 10 * s, hy + 6 * s, 40 * s, ink);
  }
}

// Shot s004: Wide Max holds fist up, Jake shocked
function renderS004(g: CanvasRenderingContext2D, t: number, dur: number) {
  const { GY, CX, M } = drawCafeBackground(g, t, { z: 1.05 });
  const s = E.V(1.6, 1.7);
  const maxPos = CX - E.V(210, 190);
  const jakePos = CX + E.V(210, 190);

  const fistPose = { ...POSES.sit, eF: [24, -150] as [number, number], hF: [34, -188] as [number, number] };
  layer(g, { z: 1.05 }, 1.0, (cg) => {
    FX.chair(cg, maxPos, GY, s, '#24181e');
    FX.chair(cg, jakePos, GY, s, '#24181e');
    const tb = FX.cafeTable(cg, CX, GY);
    FX.cup(cg, CX + 60, tb.top, 1.2);

    drawFigure(cg, {
      x: maxPos,
      y: GY,
      s,
      facing: 1,
      outfit: CAST_DEFINITIONS.MAX.outfit,
      pose: posesAt(t, [[0, POSES.sit], [0.3, fistPose]]),
      expr: 'smirk',
      rim: { color: M.rim, dir: [0, -1] },
      shadow: false,
    });

    drawFigure(cg, {
      x: jakePos,
      y: GY,
      s,
      facing: -1,
      outfit: CAST_DEFINITIONS.JAKE.outfit,
      pose: POSES.sitBack,
      expr: t > 0.6 ? 'shocked' : 'surprised',
      rim: { color: M.rim, dir: [0, -1] },
      shadow: false,
    });
  });
}

// Shot s005: Coffee falling
function renderS005(g: CanvasRenderingContext2D, t: number, dur: number) {
  const GY = E.H * E.V(0.82, 0.68);
  const tx = E.W / 2;
  const top = GY - 162;
  const cam = { z: E.V(2.0, 1.8), x: 20, y: top - E.H / 2 + 40 };
  drawCafeBackground(g, t, cam);

  const push = ease.out(prog(t, 0.95, 2.0));
  const cx = lerp(tx + 60, tx - 175, push);
  const fall = Math.max(0, t - 2.0);
  const cy = top + 0.5 * 260 * fall * fall;
  const rot = -1.1 * ease.inOut(prog(t, 1.3, 3.1));

  layer(g, cam, 1.0, (cg) => {
    FX.cafeTable(cg, tx, GY);
    FX.cup(cg, cx, cy, 1.2, rot);
  });
}

// Shot s006: TIME FREEZE cup in air
function renderS006(g: CanvasRenderingContext2D, t: number, dur: number) {
  blurLayer(g, 12, (bg) => drawCafeBackground(bg, 0, { z: 1.9, x: -100 }));
  veil(g, '#101628', 0.45); // Cool time-stop tint

  const x = E.W / 2;
  const y = E.H * 0.46;
  FX.drops(g, t, { count: 50, color: '#d8e4ff', drift: 3 });
  FX.cup(g, x, y, E.V(5.5, 4.8), -1.1);
  FX.rings(g, x, y - 40, t, { count: 3, r0: 120, r1: 520, speed: 0.35, color: '#e8f0ff', a: 0.35 });
  UI.badge(g, { str: '100x', a: ease.out(prog(t, 0.3, 0.8)) });
}

// Shot s007: Hand catches cup
function renderS007(g: CanvasRenderingContext2D, t: number, dur: number) {
  blurLayer(g, 14, (bg) => drawCafeBackground(bg, t, { z: 1.7, x: -260 }));
  veil(g, '#120a10', 0.35);

  const land = 2.3;
  const d = ease.inOut(prog(t, 0, land));
  const hx = E.W * 0.5;
  const hy = E.H * E.V(0.72, 0.66);
  const cy = lerp(E.H * 0.18, hy - 70, d);
  const s = E.V(1.5, 1.4);
  const ink = '#0e0b12';

  seg(g, [[hx - 40 * s, hy + 10 * s], [-300, hy + 260 * s]], 70 * s, ink);
  seg(g, [[hx - 160 * s, hy + 70 * s], [-300, hy + 260 * s]], 96 * s, CAST_DEFINITIONS.MAX.outfit.color || '#d64a33');
  rr(g, hx - 70 * s, hy - 10 * s, 140 * s, 34 * s, 17 * s);
  g.fillStyle = ink;
  g.fill();

  FX.cup(g, hx, cy, E.V(2.4, 2.2), -0.25 * (1 - d));
  if (t > land) {
    FX.rings(g, hx, hy - 40, t - land, { count: 2, r0: 50, r1: 260, color: '#fff3e0' });
  }
}

// Shot s009: Jake bigFace: "How?"
function renderS009(g: CanvasRenderingContext2D, t: number, dur: number, globalT: number) {
  blurLayer(g, 14, (bg) => drawCafeBackground(bg, t, { z: 1.6, x: 260 }));
  veil(g, '#120a10', 0.35);
  const r = E.V(290, 320) * (1 + 0.03 * t);
  const talk = Math.sin(t * 12) > 0 ? 0.7 : 0;
  bigFace(g, E.W / 2 + E.V(120, 0), E.H * E.V(0.6, 0.55), r, {
    outfit: CAST_DEFINITIONS.JAKE.outfit,
    expr: t < 2.5 ? 'shocked' : 'surprised',
    talk,
    rimColor: '#ffc68a',
    rimSide: 1,
  });
}

// Shot s010: Blueprint NORMAL reaction time
function renderS010(g: CanvasRenderingContext2D, t: number, dur: number) {
  renderReactionBlueprint(g, t, false);
}

// Shot s011: Blueprint YOU reaction time
function renderS011(g: CanvasRenderingContext2D, t: number, dur: number) {
  renderReactionBlueprint(g, t, true);
  UI.badge(g, { str: '10x FASTER', a: ease.out(prog(t, 0.6, 1.1)), size: E.V(40, 46) });
}

function renderReactionBlueprint(g: CanvasRenderingContext2D, t: number, showYou: boolean) {
  UI.blueprint(g);
  const ui = E.style.ui;
  const bpc = ui.blueprint;
  const x0 = E.V(560, 140);
  const x1 = E.W - E.V(200, 120);
  const scale = (x1 - x0) / 0.3;
  const rowY = [E.H * E.V(0.38, 0.4), E.H * E.V(0.66, 0.6)];

  seg(g, [[x0, rowY[1] + E.V(110, 140)], [x1, rowY[1] + E.V(110, 140)]], 2, alpha(bpc, 0.6));
  for (let k = 0; k <= 6; k++) {
    const x = x0 + k * 0.05 * scale;
    seg(g, [[x, rowY[1] + E.V(100, 130)], [x, rowY[1] + E.V(120, 150)]], 2, alpha(bpc, 0.6));
    drawText(g, (k * 0.05).toFixed(2) + 's', x, rowY[1] + E.V(150, 180), {
      size: E.V(28, 30),
      color: alpha(bpc, 0.8),
      font: FONTS.ui,
      weight: 800,
    });
  }

  const renderBar = (y: number, label: string, value: string, frac: number, color: string) => {
    drawText(g, label, x0, y - 62, { size: E.V(40, 44), color, font: FONTS.ui, weight: 900, align: 'left' });
    rr(g, x0, y - 26, x1 - x0, 52, 26);
    g.fillStyle = alpha(color, 0.1);
    g.fill();
    const w = Math.max(52, (x1 - x0) * frac);
    rr(g, x0, y - 26, w, 52, 26);
    g.fillStyle = color;
    g.fill();
    glow(g, x0 + w, y, 60, color, 0.5);
    drawText(g, value, x0 + w + 28, y + 2, {
      size: E.V(58, 60),
      color,
      font: FONTS.ui,
      weight: 900,
      align: 'left',
    });
  };

  const pN = showYou ? 1 : ease.inOut(prog(t, 0.5, 2.2));
  renderBar(rowY[0], 'NORMAL HUMAN', '0.25 s', (0.25 / 0.3) * pN, bpc);

  if (showYou) {
    const pY = ease.out(prog(t, 0.4, 0.7));
    renderBar(rowY[1], 'YOU', '0.025 s', (0.025 / 0.3) * pY, ui.gold);
  }
}

// Shot s012: Title card
function renderS012(g: CanvasRenderingContext2D, t: number, dur: number) {
  const M = mood('dusk');
  layer(g, { z: 1.05 }, 0.2, (cg) => {
    backdrop(cg, M.sky);
    FX.sun(cg, E.W / 2, E.H * E.V(0.62, 0.55), E.V(90, 110), '#fff3dc', M.key, 5);
    FX.godRays(cg, E.W / 2, E.H * E.V(0.62, 0.55), { count: 12, a: 0.08, t });
    FX.skyline(cg, { y: E.H * E.V(0.74, 0.66), color: '#2a1f36' });
  });
  FX.dust(g, t, { count: 30, color: '#ffd9b0' });
  UI.titleCard(g, t, {
    lines: ['WHAT IF YOUR REACTION TIME', 'WAS 10X FASTER?'],
    dur,
    y: E.H * E.V(0.4, 0.38),
  });
}

// Shot s013: Lab scene with Doc
function renderS013(g: CanvasRenderingContext2D, t: number, dur: number) {
  const M = mood('interiorWarm');
  const GY = E.H * E.V(0.8, 0.68);
  const CX = E.W / 2;

  layer(g, { z: 1.02 }, 0.35, (cg) => {
    cg.fillStyle = M.wall;
    cg.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
    // Wall board
    const bx = CX - E.V(760, 470);
    const by = GY - E.V(520, 1000);
    rr(cg, bx, by, 300, 140, 8);
    cg.fillStyle = '#1b1828';
    cg.fill();
    drawText(cg, 'EYE -> BRAIN -> MUSCLE', bx + 150, by + 70, { size: 20, color: '#cfc7dd', font: FONTS.ui });
  });

  layer(g, { z: 1.02 }, 1.0, (cg) => {
    const s = E.V(1.35, 1.5);
    drawFigure(cg, {
      x: CX - E.V(40, 190),
      y: GY,
      s,
      facing: -1,
      outfit: CAST_DEFINITIONS.DOC.outfit,
      pose: breathe(POSES.point, t),
      expr: 'smile',
      prop: 'pointer',
      rim: { color: M.rim, dir: [0, -1] },
    });
    drawFigure(cg, {
      x: CX + E.V(260, 210),
      y: GY,
      s,
      facing: -1,
      outfit: CAST_DEFINITIONS.MAX.outfit,
      pose: breathe(POSES.stand, t, 1, 3),
      expr: 'thinking',
      rim: { color: M.rim, dir: [0, -1] },
    });
  });
}

// Shot s014: Blueprint pipeline SEE -> DECIDE -> MOVE
function renderS014(g: CanvasRenderingContext2D, t: number, dur: number) {
  UI.blueprint(g);
  const c = E.style.ui.blueprint;
  const gold = E.style.ui.gold;
  const pts: [number, number][] = E.vertical
    ? [[E.W / 2, E.H * 0.2], [E.W / 2, E.H * 0.41], [E.W / 2, E.H * 0.62]]
    : [[E.W * 0.2, E.H * 0.48], [E.W * 0.5, E.H * 0.48], [E.W * 0.8, E.H * 0.48]];

  const labels = ['SEE', 'DECIDE', 'MOVE'];
  const R = E.V(80, 95);

  pts.forEach(([x, y], i) => {
    const on = t > i * 1.3;
    const col = on ? gold : alpha(c, 0.5);
    circle(g, x, y, R, alpha(col, 0.1));
    ring(g, x, y, R, 4, col);
    if (on) glow(g, x, y, R * 1.5, gold, 0.25);
    drawText(g, labels[i], x, y, { size: E.V(36, 40), color: col, font: FONTS.ui, weight: 900 });
  });

  const ms = clamp(t / dur) * 0.25;
  UI.readout(g, {
    label: 'ELAPSED',
    value: ms.toFixed(3) + ' s',
    x: E.W / 2,
    y: E.H * E.V(0.84, 0.72),
    align: 'center',
  });
}

// Generic fallback renderer for newly generated or customized shots
function renderGenericShot(g: CanvasRenderingContext2D, shot: Shot, t: number, dur: number) {
  const M = mood('dusk');
  backdrop(g, M.sky);
  FX.sun(g, E.W * 0.7, E.H * 0.4, 60, '#fff3dc', M.key);
  FX.skyline(g, { y: E.H * 0.7, color: '#1a1828' });
  FX.dust(g, t, { count: 25 });

  const GY = E.H * 0.75;
  drawFigure(g, {
    x: E.W * 0.4,
    y: GY,
    s: 1.4,
    facing: 1,
    outfit: CAST_DEFINITIONS.MAX.outfit,
    pose: breathe(POSES.relaxed, t),
    expr: 'smile',
    rim: { color: M.rim, dir: [0, -1] },
  });

  // Scene Title badge
  drawText(g, `${shot.id.toUpperCase()} · ${shot.scene}`, E.W / 2, 80, {
    size: 28,
    color: E.style.ui.gold,
    font: FONTS.ui,
    weight: 800,
  });

  if (shot.line) {
    drawText(g, `"${shot.line}"`, E.W / 2, E.H - 120, {
      size: 32,
      color: '#ffffff',
      font: FONTS.title,
      weight: 600,
      glow: 14,
    });
  }
}
