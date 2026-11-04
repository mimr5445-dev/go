import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Shot, VisualStyleId, AspectRatio } from '../types/studio';
import { E, STYLES, clamp } from '../engine/core';
import { renderShotToCanvas } from '../engine/shotRenderer';
import { ThreeOrbitStage } from '../engine/threeStage';
import { audioSynth } from '../engine/audioSynth';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Monitor,
  Smartphone,
} from 'lucide-react';

interface ViewportPlayerProps {
  shots: Shot[];
  totalDuration: number;
  currentGlobalTime: number;
  onTimeChange: (time: number) => void;
  styleId: VisualStyleId;
  onStyleChange: (style: VisualStyleId) => void;
  aspect: AspectRatio;
  onAspectChange: (aspect: AspectRatio) => void;
}

export const ViewportPlayer: React.FC<ViewportPlayerProps> = ({
  shots,
  totalDuration,
  currentGlobalTime,
  onTimeChange,
  styleId,
  onStyleChange,
  aspect,
  onAspectChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const threeStageRef = useRef<ThreeOrbitStage | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [loopCurrentShot, setLoopCurrentShot] = useState(false);
  const lastTriggeredCueRef = useRef<string | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const lastFrameTimestampRef = useRef<number | null>(null);

  // Initialize Three.js 3D orbit stage for 3D shots
  useEffect(() => {
    if (!threeStageRef.current) {
      threeStageRef.current = new ThreeOrbitStage(640, 360);
    }
  }, []);

  // Sync aspect ratio and style to runtime
  useEffect(() => {
    E.setAspect(aspect);
    E.setStyle(styleId);
  }, [aspect, styleId]);

  // Find active shot by current global time
  const activeShotIndex = Math.max(
    0,
    shots.findIndex((s) => currentGlobalTime >= s.start && currentGlobalTime < s.end)
  );
  const activeShot = shots[activeShotIndex] || shots[0];
  const localShotTime = activeShot ? Math.max(0, currentGlobalTime - activeShot.start) : 0;
  const shotDuration = activeShot ? activeShot.end - activeShot.start : 1;

  // Render current frame
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeShot) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If 3D shot, render three stage first
    let glCanvas: HTMLCanvasElement | null = null;
    if (activeShot.kind === '3d' && threeStageRef.current) {
      threeStageRef.current.render(localShotTime, shotDuration);
      glCanvas = threeStageRef.current.canvas;
    }

    renderShotToCanvas(ctx, activeShot, localShotTime, currentGlobalTime, glCanvas);
  }, [activeShot, localShotTime, currentGlobalTime, shotDuration]);

  // Render on time, shot, or style change
  useEffect(() => {
    renderFrame();
  }, [renderFrame]);

  // Audio Cue Triggering during playback
  useEffect(() => {
    if (!soundEnabled || !activeShot) return;

    // Set ambience
    if (activeShot.amb) {
      audioSynth.setAmbience(activeShot.amb.name, activeShot.amb.gain);
    } else {
      audioSynth.setAmbience(null);
    }

    // Check SFX cues
    if (activeShot.sfx && isPlaying) {
      activeShot.sfx.forEach((cue) => {
        const cueKey = `${activeShot.id}_${cue.name}_${cue.at}`;
        if (
          Math.abs(localShotTime - cue.at) < 0.08 &&
          lastTriggeredCueRef.current !== cueKey
        ) {
          lastTriggeredCueRef.current = cueKey;
          audioSynth.playSFX(cue.name, cue.gain, cue.pitch || 1.0);
        }
      });
    }
  }, [soundEnabled, activeShot, localShotTime, isPlaying]);

  // Main playback animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      lastFrameTimestampRef.current = null;
      return;
    }

    const tick = (now: number) => {
      if (!lastFrameTimestampRef.current) {
        lastFrameTimestampRef.current = now;
      }
      const deltaSec = (now - lastFrameTimestampRef.current) / 1000;
      lastFrameTimestampRef.current = now;

      let nextTime = currentGlobalTime + deltaSec;

      if (loopCurrentShot && activeShot) {
        if (nextTime >= activeShot.end) {
          nextTime = activeShot.start;
          lastTriggeredCueRef.current = null;
        }
      } else if (nextTime >= totalDuration) {
        nextTime = 0;
        lastTriggeredCueRef.current = null;
      }

      onTimeChange(nextTime);
      animationFrameIdRef.current = requestAnimationFrame(tick);
    };

    animationFrameIdRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isPlaying, currentGlobalTime, totalDuration, loopCurrentShot, activeShot, onTimeChange]);

  const togglePlay = () => {
    if (!isPlaying && soundEnabled) {
      audioSynth.init();
    }
    setIsPlaying(!isPlaying);
  };

  const stepFrame = (forward: boolean) => {
    setIsPlaying(false);
    const frameSec = 1 / 24;
    const nextTime = clamp(
      currentGlobalTime + (forward ? frameSec : -frameSec),
      0,
      totalDuration
    );
    onTimeChange(nextTime);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col max-w-full">
      {/* شريط رأس المشغل */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4">
        <div className="flex items-center justify-between sm:justify-start gap-2 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-mono font-bold text-amber-400 text-xs sm:text-sm bg-amber-500/10 px-1.5 sm:px-2 py-0.5 rounded border border-amber-500/20 shrink-0">
              {activeShot ? activeShot.id.toUpperCase() : 's001'}
            </span>
            <span className="text-slate-300 text-xs truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {activeShot?.scene || 'معاينة المشهد'}
            </span>
          </div>
          {activeShot?.kind === '3d' && (
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
              مدار 3D
            </span>
          )}
        </div>

        {/* أدوات النسبة والنمط البصري */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
          {/* تبديل الأبعاد 16:9 / 9:16 */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs shrink-0">
            <button
              onClick={() => onAspectChange('16:9')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                aspect === '16:9'
                  ? 'bg-slate-800 text-slate-100 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="الوضع العريض 16:9 (يوتيوب، وثائقي)"
            >
              <Monitor className="w-3.5 h-3.5" />
              عريض 16:9
            </button>
            <button
              onClick={() => onAspectChange('9:16')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                aspect === '9:16'
                  ? 'bg-slate-800 text-slate-100 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="الوضع الرأسي 9:16 (شورتس، ريلز، تيك توك)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              رأسي 9:16
            </button>
          </div>

          {/* محدد النمط البصري */}
          <select
            value={styleId}
            onChange={(e) => onStyleChange(e.target.value as VisualStyleId)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 flex-1 sm:flex-none min-w-0 max-w-full truncate"
          >
            <option value="dusk">الغسق السينمائي (Cinematic Dusk)</option>
            <option value="midnight">أزرق منتصف الليل (Midnight Blue)</option>
            <option value="golden">الساعة الذهبية (Golden Hour)</option>
            <option value="neon">نيون نوار (Neon Noir)</option>
            <option value="storybook">كتاب قصص لطيف (Soft Storybook)</option>
          </select>
        </div>
      </div>

      {/* مسرح الكانفاس التفاعلي */}
      <div className="relative bg-black flex items-center justify-center p-2 min-h-[220px] sm:min-h-[320px] md:min-h-[440px] overflow-hidden select-none">
        <canvas
          ref={canvasRef}
          width={aspect === '16:9' ? 960 : 540}
          height={aspect === '16:9' ? 540 : 960}
          className={`shadow-2xl border border-slate-800/60 object-contain rounded max-w-full ${
            aspect === '16:9' ? 'w-full max-w-[800px] aspect-[16/9]' : 'h-[320px] sm:h-[440px] aspect-[9/16]'
          }`}
        />

        {/* عرض النص المنطوق أثناء المشهد */}
        {activeShot?.line && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-max max-w-[calc(100%-1.5rem)] text-center px-3 sm:px-4 py-1.5 bg-black/80 backdrop-blur-sm rounded-lg border border-white/10 text-white text-xs md:text-sm font-medium pointer-events-none shadow-lg">
            {activeShot.line}
          </div>
        )}
      </div>

      {/* شريط التحكم السفلي */}
      <div className="px-3 sm:px-4 py-3 bg-slate-950 border-t border-slate-800/80 flex flex-col gap-2 min-w-0">
        {/* شريط التمرير الزمني */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-400 w-12 text-right" dir="ltr">
            {currentGlobalTime.toFixed(2)}s
          </span>
          <div className="relative flex-1 flex items-center">
            <input
              type="range"
              min="0"
              max={totalDuration || 1}
              step="0.04"
              value={currentGlobalTime}
              onChange={(e) => {
                setIsPlaying(false);
                onTimeChange(parseFloat(e.target.value));
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400"
            />
          </div>
          <span className="text-[11px] font-mono text-slate-500 w-12" dir="ltr">
            {totalDuration.toFixed(2)}s
          </span>
        </div>

        {/* أزرار التشغيل والتحكم */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1">
            <button
              onClick={() => stepFrame(false)}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
              title="الرجوع إطاراً واحداً (1/24 ثانية)"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors shadow-sm"
              title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل المشاهد'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              onClick={() => stepFrame(true)}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
              title="التقدم إطاراً واحداً (1/24 ثانية)"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={() => setLoopCurrentShot(!loopCurrentShot)}
              className={`p-1.5 rounded-lg transition-colors ${
                loopCurrentShot ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`}
              title="تكرار اللقطة الحالية فقط"
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* تفاصيل اللقطة والانتقال */}
          <div className="hidden lg:flex items-center gap-3 text-xs text-slate-400 font-mono" dir="ltr">
            <span>
              Shot: <strong className="text-slate-200">{activeShot?.id}</strong> ({localShotTime.toFixed(2)}s /{' '}
              {shotDuration.toFixed(2)}s)
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Transition: {activeShot?.in?.type || 'cut'}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Bars: {activeShot?.bars || 'wide'}</span>
          </div>

          {/* تفعيل الصوت التجريبي */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!soundEnabled) {
                  audioSynth.init();
                  audioSynth.playSFX('pop', -10);
                } else {
                  audioSynth.stopAll();
                }
                setSoundEnabled(!soundEnabled);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                soundEnabled
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="تفعيل التخليق الصوتي المباشر للمؤثرات Sound Synth"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{soundEnabled ? 'صوت SFX: مفعّل' : 'صوت SFX: معطّل'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
