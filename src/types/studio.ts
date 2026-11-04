// Type definitions for aitrends-2d-studio

export type AspectRatio = '16:9' | '9:16';
export type Resolution = '720p' | '1080p' | '1440p' | '2160p' | '4k';
export type VisualStyleId = 'dusk' | 'midnight' | 'golden' | 'neon' | 'storybook';
export type TransitionType = 'cut' | 'fade' | 'dip' | 'dipWhite' | 'flash' | 'whip' | 'zoom';
export type BarType = 'wide' | 'scope' | 'none' | 'thin' | null;

export interface Transition {
  type: TransitionType;
  dur?: number;
  dir?: number;
}

export interface SFXCue {
  at: number; // seconds from shot start
  name: string;
  gain: number; // dB (typically -6 to -16)
  dur?: number;
  pitch?: number;
  seed?: number;
}

export interface AmbienceCue {
  name: 'murmur' | 'rain' | 'wind' | 'city' | 'roomtone' | 'hum';
  gain: number; // dB (typically -18 to -28)
  seed?: number;
}

export interface Shot {
  id: string; // e.g. "s001"
  start: number; // seconds
  end: number; // seconds
  line: string; // spoken narration line
  scene: string; // scene visual description
  set?: string; // e.g. "cafe", "lab", "blueprint"
  bars?: BarType;
  in?: Transition;
  sfx?: SFXCue[];
  amb?: AmbienceCue;
  params?: Record<string, unknown>;
  vignette?: boolean;
  captions?: boolean;
  notes?: string;
  kind?: '2d' | '3d';
}

export interface MusicSection {
  start: number;
  end: number;
  mood: 'mystery' | 'tension' | 'action' | 'wonder' | 'hopeful' | 'sad' | 'triumph' | 'playful' | 'calm' | 'dark' | 'epic';
  intensity: number; // 0.0 to 1.0
}

export interface StoryShotsConfig {
  title: string;
  duration: number; // total duration in seconds
  shots: Shot[];
  music: MusicSection[];
  sfx?: Array<{ t: number; name: string; gain: number }>;
}

export interface ProjectConfig {
  title: string;
  aspect: AspectRatio;
  resolution: Resolution;
  fps: number;
  style: VisualStyleId;
  voiceover: string;
  script?: string | null;
  duration: number;
  captions: boolean;
  bars?: BarType;
  fadeIn: number;
  fadeOut: number;
  music: {
    enabled: boolean;
    gainDb: number;
    file?: string;
    seed?: number;
    key?: string;
  };
  sfx: {
    enabled: boolean;
    gainDb: number;
  };
  loudness: number;
}

export interface CharacterOutfit {
  top?: 'hoodie' | 'labcoat' | 'trench' | 'jersey' | 'tshirt' | 'suit' | 'dress' | 'tracksuit' | 'none';
  color?: string;
  color2?: string;
  legs?: string;
  head?: 'cap' | 'capBack' | 'beanie' | 'fedora' | 'headband' | 'visor' | 'hood' | 'ponytail' | 'bun' | 'curly' | 'spiky' | 'none';
  headColor?: string;
  face?: 'glasses' | 'sunglasses' | null;
  gloves?: string;
  number?: string;
  kid?: boolean;
}

export interface InvariantCheckResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalShots: number;
    duration: number;
    medianLength: number;
    minLength: number;
    maxLength: number;
    sfxCount: number;
    musicCount: number;
    has3d: boolean;
  };
}
