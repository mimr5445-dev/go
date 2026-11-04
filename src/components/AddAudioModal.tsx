import React, { useState, useEffect } from 'react';
import { Shot, SFXCue } from '../types/studio';
import { audioSynth } from '../engine/audioSynth';
import { X, Volume2, Play, Check, Music2 } from 'lucide-react';

interface AddAudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  shots: Shot[];
  initialShotId?: string | null;
  onConfirm: (shotId: string, cue: SFXCue) => void;
}

const SFX_CATEGORIES: { name: string; items: string[] }[] = [
  {
    name: 'حركة وانتقالات (Motion & Whoosh)',
    items: ['whoosh', 'swish', 'carpass', 'riser', 'whip', 'zoom'],
  },
  {
    name: 'ضربات وتأثيرات (Impact & Hits)',
    items: ['impact', 'hit', 'kick', 'pop', 'blip'],
  },
  {
    name: 'زمن وإيقاع (Time & Rhythm)',
    items: ['tick', 'clock', 'heartbeat', 'slowmo', 'freeze'],
  },
  {
    name: 'واجهة وتنبيهات (UI & Accents)',
    items: ['ding', 'shimmer', 'stinger', 'counter', 'phonebuzz', 'phonering', 'powerup', 'glitch', 'flash'],
  },
  {
    name: 'بيئة وأصوات عامة (Atmosphere & Foley)',
    items: ['buzz', 'footstep', 'whistle', 'cheer', 'applause', 'murmur', 'rain', 'thunder', 'wind', 'roomtone', 'city', 'hum'],
  },
];

const ALL_SFX = Array.from(new Set(SFX_CATEGORIES.flatMap((c) => c.items)));

export const AddAudioModal: React.FC<AddAudioModalProps> = ({
  isOpen,
  onClose,
  shots,
  initialShotId,
  onConfirm,
}) => {
  const [selectedShotId, setSelectedShotId] = useState<string>(
    initialShotId || (shots[0] ? shots[0].id : '')
  );
  const [selectedSFX, setSelectedSFX] = useState<string>('pop');
  const [offsetSec, setOffsetSec] = useState<number>(0.4);
  const [gainDb, setGainDb] = useState<number>(-10);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Sync initial shot when modal opens or initialShotId changes
  useEffect(() => {
    if (initialShotId && shots.some((s) => s.id === initialShotId)) {
      setSelectedShotId(initialShotId);
    } else if (shots[0]) {
      setSelectedShotId(shots[0].id);
    }
  }, [initialShotId, shots, isOpen]);

  if (!isOpen) return null;

  const currentShot = shots.find((s) => s.id === selectedShotId) || shots[0];
  const shotDuration = currentShot ? Math.max(0.2, currentShot.end - currentShot.start) : 3.0;

  const handleAudition = (name: string, gain: number) => {
    setIsPlaying(true);
    try {
      audioSynth.playSFX(name, gain);
    } catch {
      // Audio fallback
    }
    setTimeout(() => setIsPlaying(false), 400);
  };

  const handleConfirm = () => {
    if (!currentShot) return;
    const clampedOffset = Math.min(Math.max(0, offsetSec), shotDuration);
    const cue: SFXCue = {
      name: selectedSFX,
      at: Math.round(clampedOffset * 100) / 100,
      gain: Math.round(gainDb),
    };
    onConfirm(currentShot.id, cue);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto overflow-x-hidden overscroll-contain"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/*
        Mobile: full available width (minus a small safe margin), height capped to the
        real visible viewport (dvh) and the body scrolls vertically only.
        ≥ sm: the original centred dialog is preserved.
      */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg dialog-shell shadow-2xl flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 flex items-center justify-between gap-2 bg-slate-900/95 backdrop-blur z-20 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Volume2 className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-100 truncate">
                إضافة مقطع صوتي إلى المشهد
              </h2>
              <span className="text-[11px] text-cyan-400 truncate font-mono">
                مؤثر صوتي تخليقي متزامن بدقة (SFX)
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Vertically Stacked & Fully Responsive (scrolls on one axis only) */}
        <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-5 text-xs text-slate-300 flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain">
          {/* الحقل 1: اختيار اللقطة المستهدفة */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-semibold text-xs">
              اللقطة المستهدفة (Shot):
            </label>
            <select
              value={selectedShotId}
              onChange={(e) => {
                setSelectedShotId(e.target.value);
                const s = shots.find((sh) => sh.id === e.target.value);
                if (s) {
                  const dur = s.end - s.start;
                  if (offsetSec > dur) setOffsetSec(Math.round(dur * 0.25 * 100) / 100);
                }
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 font-medium"
            >
              {shots.map((shot) => {
                const dur = shot.end - shot.start;
                return (
                  <option key={shot.id} value={shot.id}>
                    {shot.id} — {shot.scene} ({dur.toFixed(2)}s)
                  </option>
                );
              })}
            </select>

            {/* تفاصيل اللقطة المختارة */}
            {currentShot && (
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5 flex items-center justify-between gap-2 text-[11px] text-slate-400 min-w-0">
                <span className="truncate flex-1 min-w-0">
                  {currentShot.line ? `"${currentShot.line}"` : currentShot.scene}
                </span>
                <span className="font-mono text-amber-400 font-semibold shrink-0 whitespace-nowrap" dir="ltr">
                  مدة: {shotDuration.toFixed(2)}s
                </span>
              </div>
            )}
          </div>

          {/* الحقل 2: نوع المؤثر الصوتي واستماعه الفوري */}
          <div className="space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <label className="block text-slate-300 font-semibold text-xs">
                نوع المؤثر الصوتي (SFX Effect):
              </label>
              <button
                type="button"
                onClick={() => handleAudition(selectedSFX, gainDb)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 w-full sm:w-auto ${
                  isPlaying
                    ? 'bg-cyan-500 text-slate-950 scale-95 shadow-md'
                    : 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>استماع للتجربة</span>
              </button>
            </div>

            <select
              value={selectedSFX}
              onChange={(e) => {
                setSelectedSFX(e.target.value);
                handleAudition(e.target.value, gainDb);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 font-mono text-left"
              dir="ltr"
            >
              {SFX_CATEGORIES.map((category) => (
                <optgroup key={category.name} label={category.name} className="text-slate-400 font-sans">
                  {category.items.map((item) => (
                    <option key={item} value={item} className="text-slate-100 font-mono">
                      {item}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            {/* اختيارات سريعة شائعة (Quick Pills) */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['whoosh', 'impact', 'pop', 'ding', 'freeze', 'heartbeat', 'buzz', 'glitch'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setSelectedSFX(preset);
                    handleAudition(preset, gainDb);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                    selectedSFX === preset
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                  }`}
                  dir="ltr"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* الحقل 3: توقيت بدء الصوت داخل اللقطة (Timing / Offset at) */}
          <div className="space-y-2 bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 min-w-0">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-xs">
              <label className="text-slate-300 font-semibold">
                توقيت بدء الصوت (بالثانية من بداية اللقطة):
              </label>
              <div className="flex items-center gap-1 font-mono text-amber-400 font-bold shrink-0" dir="ltr">
                <span>{offsetSec.toFixed(2)}s</span>
                <span className="text-slate-500">/ {shotDuration.toFixed(2)}s</span>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max={shotDuration}
              step="0.05"
              value={Math.min(offsetSec, shotDuration)}
              onChange={(e) => setOffsetSec(parseFloat(e.target.value) || 0)}
              className="w-full min-w-0 accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
            />

            <div className="flex items-center justify-between gap-1 text-[10px] text-slate-500 font-mono" dir="ltr">
              <span className="truncate">0.00s (بداية اللقطة)</span>
              <span className="hidden sm:inline shrink-0">{(shotDuration / 2).toFixed(2)}s</span>
              <span className="truncate text-right">{shotDuration.toFixed(2)}s (نهاية اللقطة)</span>
            </div>
          </div>

          {/* الحقل 4: مستوى الصوت والكسب (Gain in dB) */}
          <div className="space-y-2 bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 min-w-0">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-xs">
              <label className="text-slate-300 font-semibold">
                مستوى الصوت (الكسب بالديسيبل - Gain dB):
              </label>
              <span className="font-mono text-cyan-400 font-bold shrink-0" dir="ltr">
                {gainDb} dB
              </span>
            </div>

            <input
              type="range"
              min="-24"
              max="0"
              step="1"
              value={gainDb}
              onChange={(e) => setGainDb(parseInt(e.target.value, 10) || -10)}
              className="w-full min-w-0 accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
            />

            <div className="flex items-center justify-between gap-1 text-[10px] text-slate-500 font-mono" dir="ltr">
              <span className="truncate">-24 dB (خافت)</span>
              <span className="hidden sm:inline shrink-0">-12 dB (متوازن)</span>
              <span className="truncate text-right">0 dB (مرتفع)</span>
            </div>
          </div>
        </div>

        {/*
          Modal Footer - pinned to the bottom of the dialog so the action buttons are
          always reachable (the body above scrolls independently on small screens).
        */}
        <div className="bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 z-20 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-3 sm:py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs transition-colors text-center"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[2.5] shrink-0" />
            <span>تأكيد وإضافة المقطع الصوتي</span>
          </button>
        </div>
      </div>
    </div>
  );
};
