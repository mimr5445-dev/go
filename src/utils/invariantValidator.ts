// utils/invariantValidator.ts — Enforces the 11 Invariants of aitrends-2d-studio
import { StoryShotsConfig, Shot, InvariantCheckResult } from '../types/studio';

export function validateShots(config: StoryShotsConfig): InvariantCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const shots = config.shots;

  if (!shots || shots.length === 0) {
    return {
      valid: false,
      errors: ['No shots defined in project.'],
      warnings: [],
      stats: {
        totalShots: 0,
        duration: 0,
        medianLength: 0,
        minLength: 0,
        maxLength: 0,
        sfxCount: 0,
        musicCount: 0,
        has3d: false,
      },
    };
  }

  // Invariant 1: First shot must start at 0
  if (Math.abs(shots[0].start) > 0.001) {
    errors.push(`First shot (${shots[0].id}) must start at 0.0s (currently starts at ${shots[0].start}s).`);
  }

  // Invariant 2: Shots must be strictly contiguous (end[i] === start[i+1])
  for (let i = 0; i < shots.length - 1; i++) {
    const cur = shots[i];
    const nxt = shots[i + 1];
    const diff = Math.abs(cur.end - nxt.start);
    if (diff > 0.01) {
      errors.push(
        `Discontinuity between ${cur.id} and ${nxt.id}: ${cur.id} ends at ${cur.end.toFixed(
          2
        )}s, but ${nxt.id} starts at ${nxt.start.toFixed(2)}s (gap: ${(nxt.start - cur.end).toFixed(2)}s).`
      );
    }
  }

  // Invariant 3: Last shot must end at duration
  const lastShot = shots[shots.length - 1];
  if (Math.abs(lastShot.end - config.duration) > 0.05) {
    errors.push(
      `Project duration mismatch: config duration is ${config.duration}s, but last shot (${lastShot.id}) ends at ${lastShot.end}s.`
    );
  }

  // Invariant 4: ID uniqueness
  const seenIds = new Set<string>();
  shots.forEach((s) => {
    if (seenIds.has(s.id)) {
      errors.push(`Duplicate shot ID '${s.id}' found.`);
    }
    seenIds.add(s.id);
  });

  // Invariant 5: Shot pacing checks
  const lengths = shots.map((s) => s.end - s.start);
  lengths.sort((a, b) => a - b);
  const minLength = lengths[0];
  const maxLength = lengths[lengths.length - 1];
  const medianLength = lengths[Math.floor(lengths.length / 2)];

  shots.forEach((s) => {
    const dur = s.end - s.start;
    if (dur <= 0) {
      errors.push(`Shot ${s.id} has invalid negative or zero duration (${dur.toFixed(2)}s).`);
    } else if (dur > 8.0) {
      warnings.push(`Shot ${s.id} is long (${dur.toFixed(1)}s > 8s). Ensure camera motion or consider splitting.`);
    } else if (dur < 0.8 && !s.scene.toLowerCase().includes('cut') && !s.scene.toLowerCase().includes('snatch')) {
      warnings.push(`Shot ${s.id} is very short (${dur.toFixed(2)}s < 0.8s). Ensure it is an intended fast action cut.`);
    }

    // Invariant 6: SFX cue timing within shot bounds
    if (s.sfx) {
      s.sfx.forEach((c) => {
        if (c.at > dur + 0.1) {
          warnings.push(
            `SFX '${c.name}' in shot ${s.id} is scheduled at ${c.at.toFixed(2)}s, which is past the shot duration (${dur.toFixed(2)}s).`
          );
        }
      });
    }
  });

  // Invariant 7: Music section contiguity
  if (config.music && config.music.length > 0) {
    if (config.music[0].start !== 0) {
      warnings.push(`First music section starts at ${config.music[0].start}s instead of 0s.`);
    }
    for (let i = 0; i < config.music.length - 1; i++) {
      const cur = config.music[i];
      const nxt = config.music[i + 1];
      if (Math.abs(cur.end - nxt.start) > 0.1) {
        warnings.push(`Music sections between ${cur.mood} and ${nxt.mood} have a gap or overlap.`);
      }
    }
  }

  let sfxCount = 0;
  shots.forEach((s) => {
    if (s.sfx) sfxCount += s.sfx.length;
  });

  const has3d = shots.some((s) => s.kind === '3d' || s.scene.toLowerCase().includes('3d'));

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      totalShots: shots.length,
      duration: config.duration,
      medianLength: Math.round(medianLength * 100) / 100,
      minLength: Math.round(minLength * 100) / 100,
      maxLength: Math.round(maxLength * 100) / 100,
      sfxCount,
      musicCount: config.music?.length || 0,
      has3d,
    },
  };
}

/**
 * Auto-aligns all shots to be strictly contiguous and updates the total duration
 */
export function autoAlignShots(config: StoryShotsConfig): StoryShotsConfig {
  const updatedShots: Shot[] = [];
  let currentStart = 0;

  for (let i = 0; i < config.shots.length; i++) {
    const s = config.shots[i];
    const originalDur = Math.max(0.5, s.end - s.start);
    const newEnd = Math.round((currentStart + originalDur) * 100) / 100;
    updatedShots.push({
      ...s,
      start: currentStart,
      end: newEnd,
    });
    currentStart = newEnd;
  }

  return {
    ...config,
    duration: currentStart,
    shots: updatedShots,
  };
}
