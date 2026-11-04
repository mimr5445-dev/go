import React, { useState } from 'react';
import { Shot, SFXCue, TransitionType, BarType } from '../types/studio';
import { audioSynth } from '../engine/audioSynth';
import { X, Volume2, Plus, Trash2, Play, Sparkles } from 'lucide-react';

interface ShotEditorModalProps {
  shot: Shot;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedShot: Shot) => void;
  onSplit: (shot: Shot, splitAtLocalSec: number) => void;
  onDelete: (shotId: string) => void;
}

const SFX_LIBRARY = [
  'whoosh',
  'swish',
  'impact',
  'hit',
  'riser',
  'slowmo',
  'freeze',
  'tick',
  'clock',
  'heartbeat',
  'pop',
  'blip',
  'counter',
  'ding',
  'shimmer',
  'stinger',
  'footstep',
  'kick',
  'whistle',
  'carpass',
  'phonebuzz',
  'phonering',
  'cheer',
  'applause',
  'murmur',
  'rain',
  'thunder',
  'wind',
  'roomtone',
  'city',
  'hum',
  'powerup',
  'glitch',
  'flash',
  'buzz',
];

export const ShotEditorModal: React.FC<ShotEditorModalProps> = ({
  shot,
  isOpen,
  onClose,
  onSave,
  onSplit,
  onDelete,
}) => {
  const [editedShot, setEditedShot] = useState<Shot>({ ...shot });
  const [splitOffset, setSplitOffset] = useState<number>(
    Math.round(((shot.end - shot.start) / 2) * 100) / 100
  );

  if (!isOpen) return null;

  const duration = Math.max(0.1, editedShot.end - editedShot.start);

  const handleAddSFX = () => {
    const newCue: SFXCue = {
      at: Math.round((duration * 0.25) * 100) / 100,
      name: 'pop',
      gain: -10,
    };
    setEditedShot({
      ...editedShot,
      sfx: [...(editedShot.sfx || []), newCue],
    });
  };

  const handleRemoveSFX = (index: number) => {
    const updated = [...(editedShot.sfx || [])];
    updated.splice(index, 1);
    setEditedShot({ ...editedShot, sfx: updated });
  };

  const handleUpdateSFX = (index: number, field: keyof SFXCue, val: any) => {
    const updated = [...(editedShot.sfx || [])];
    updated[index] = { ...updated[index], [field]: val };
    setEditedShot({ ...editedShot, sfx: updated });
  };

  const auditionCue = (name: string, gain: number) => {
    audioSynth.playSFX(name, gain);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl w-full max-w-2xl max-h-[94vh] sm:max-h-[90vh] shadow-2xl flex flex-col overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-20">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="font-mono font-bold text-amber-400 text-sm sm:text-base bg-amber-500/10 px-2 sm:px-2.5 py-1 rounded border border-amber-500/20 shrink-0" dir="ltr">
              {editedShot.id}
            </span>
            <h2 className="text-sm sm:text-base font-semibold text-slate-100 truncate">تعديل معايير وإعدادات اللقطة</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-5 text-xs text-slate-300 flex-1 overflow-y-auto overflow-x-hidden">
          {/* Timing Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">وقت البداية (ثانية)</label>
              <input
                type="number"
                step="0.05"
                value={editedShot.start}
                onChange={(e) => setEditedShot({ ...editedShot, start: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">وقت النهاية (ثانية)</label>
              <input
                type="number"
                step="0.05"
                value={editedShot.end}
                onChange={(e) => setEditedShot({ ...editedShot, end: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">المدة المحسوبة</label>
              <div className="w-full bg-slate-950/60 border border-slate-800/60 rounded-lg px-3 py-2 text-amber-300 font-mono" dir="ltr">
                {duration.toFixed(2)}s
              </div>
            </div>
          </div>

          {/* Line and Scene */}
          <div>
            <label className="block text-slate-400 font-medium mb-1.5">النص المنطوق / التعليق الصوتي</label>
            <textarea
              rows={2}
              value={editedShot.line}
              onChange={(e) => setEditedShot({ ...editedShot, line: e.target.value })}
              placeholder="الكلمات المنطوقة خلال هذه اللقطة بالتحديد..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1.5">الوصف البصري للمشهد والحركة</label>
            <textarea
              rows={2}
              value={editedShot.scene}
              onChange={(e) => setEditedShot({ ...editedShot, scene: e.target.value })}
              placeholder="مثال: لقطة قريبة لماكس وهو يمسك الذبابة، كاميرا تقترب بسرعة وتجميد حركي..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 leading-relaxed"
            />
          </div>

          {/* Set, Transition & Letterbox */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1.5">البيئة والموقع (Set)</label>
              <select
                value={editedShot.set || 'cafe'}
                onChange={(e) => setEditedShot({ ...editedShot, set: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value="cafe">المقهى الخارجي (Cafe - Golden)</option>
                <option value="lab">مختبر العلوم (Lab - Interior)</option>
                <option value="blueprint">المخطط الشبكي العلمي (Blueprint)</option>
                <option value="skyline">أفق المدينة عند الغروب (Skyline)</option>
                <option value="bedroom">غرفة نوم ليلية (Bedroom)</option>
                <option value="void">فضاء تجريدي سينمائي (Void)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1.5">الانتقال الداخلي (Transition In)</label>
              <select
                value={editedShot.in?.type || 'cut'}
                onChange={(e) =>
                  setEditedShot({
                    ...editedShot,
                    in: { type: e.target.value as TransitionType, dur: 0.4 },
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value="cut">قطع مباشر (Cut - Standard)</option>
                <option value="fade">تلاشٍ ناعم (Fade)</option>
                <option value="dip">انحدار للسواد (Dip to Black)</option>
                <option value="dipWhite">انحدار للبياض (Dip to White)</option>
                <option value="flash">وميض فائق (Flash / Freeze)</option>
                <option value="whip">مسح كاميرا سريع (Whip Pan)</option>
                <option value="zoom">تقريب سريع (Zoom In)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1.5">أشرطة السينما (Letterbox)</label>
              <select
                value={editedShot.bars ?? 'default'}
                onChange={(e) =>
                  setEditedShot({
                    ...editedShot,
                    bars: e.target.value === 'default' ? null : (e.target.value as BarType),
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value="default">افتراضي (Wide 2:1)</option>
                <option value="scope">سكوب سينمائي عريض (Scope 2.39:1)</option>
                <option value="wide">عريض قياسي (Wide 2:1)</option>
                <option value="none">بدون أشرطة (Full Bleed)</option>
                <option value="thin">شريط رفيع (Thin 1.85:1)</option>
              </select>
            </div>
          </div>

          {/* Sound Effects (SFX Cues) */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-slate-200">المؤثرات الصوتية المتزامنة (SFX)</span>
              </div>
              <button
                type="button"
                onClick={handleAddSFX}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> إضافة مقطع صوتي
              </button>
            </div>

            {(!editedShot.sfx || editedShot.sfx.length === 0) && (
              <p className="text-slate-500 text-xs italic py-1">لا توجد مقاطع صوتية مضافة لهذه اللقطة حتى الآن.</p>
            )}

            <div className="space-y-2.5">
              {editedShot.sfx?.map((cue, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  {/* الصف الأول: نوع المقطع الصوتي وأزرار التشغيل والحذف */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-mono flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <select
                      value={cue.name}
                      onChange={(e) => handleUpdateSFX(idx, 'name', e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-lg px-2.5 py-1.5 flex-1 font-mono min-w-0 focus:outline-none focus:border-cyan-500"
                      dir="ltr"
                    >
                      {SFX_LIBRARY.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => auditionCue(cue.name, cue.gain)}
                      className="p-1.5 rounded-lg text-cyan-400 bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850 shrink-0 transition-colors"
                      title="استماع للمؤثر الصوتي"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveSFX(idx)}
                      className="p-1.5 rounded-lg text-rose-400 bg-slate-950 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-850 shrink-0 transition-colors"
                      title="حذف المقطع الصوتي"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* الصف الثاني: التوقيت ومستوى الكسب */}
                  <div className="flex items-center justify-between sm:justify-start gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80 shrink-0">
                    <div className="flex items-center gap-1.5 font-mono text-[11px]" dir="ltr">
                      <span className="text-slate-400">at:</span>
                      <input
                        type="number"
                        step="0.05"
                        value={cue.at}
                        onChange={(e) => handleUpdateSFX(idx, 'at', parseFloat(e.target.value) || 0)}
                        className="w-16 bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-lg px-2 py-1 font-mono text-center focus:outline-none focus:border-cyan-500"
                        title="ثوانٍ من بداية اللقطة"
                      />
                      <span className="text-slate-500">s</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-[11px]" dir="ltr">
                      <span className="text-slate-400">gain:</span>
                      <input
                        type="number"
                        step="1"
                        value={cue.gain}
                        onChange={(e) => handleUpdateSFX(idx, 'gain', parseFloat(e.target.value) || -8)}
                        className="w-16 bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-lg px-2 py-1 font-mono text-center focus:outline-none focus:border-cyan-500"
                        title="مستوى الصوت بالديسيبل (-6 إلى -18)"
                      />
                      <span className="text-slate-500">dB</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ambience Bed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">الأرضية الصوتية المستمرة (Ambience Bed)</label>
              <select
                value={editedShot.amb?.name || 'none'}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'none') {
                    setEditedShot({ ...editedShot, amb: undefined });
                  } else {
                    setEditedShot({
                      ...editedShot,
                      amb: { name: val as any, gain: -24 },
                    });
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value="none">بدون أرضية صوتية (None)</option>
                <option value="murmur">همهمات مقهى وحشود (Murmur)</option>
                <option value="roomtone">صمت بيئة العمل والمختبر (Room Tone)</option>
                <option value="rain">صوت المطر المستمر (Rain)</option>
                <option value="wind">هبوب الرياح (Wind)</option>
                <option value="city">ضجيج شوارع المدينة (City)</option>
                <option value="hum">أزيز تيار إلكتروني (Hum)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">مستوى الصوت الخلفي (dB)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="1"
                  disabled={!editedShot.amb}
                  value={editedShot.amb?.gain || -24}
                  onChange={(e) =>
                    setEditedShot({
                      ...editedShot,
                      amb: { name: editedShot.amb?.name || 'roomtone', gain: parseFloat(e.target.value) || -24 },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono disabled:opacity-40"
                  dir="ltr"
                />
                <span className="text-slate-500 font-mono">dB</span>
              </div>
            </div>
          </div>

          {/* Split Shot Tool */}
          <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-semibold text-slate-200 block">تقسيم هذه اللقطة إلى لقطتين</span>
              <span className="text-slate-500 text-[11px]">
                يحافظ على التلاصق الرياضي الصارم: تقسيم المشهد عند {splitOffset} ثانية من البداية.
              </span>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <input
                type="number"
                step="0.1"
                min="0.5"
                max={Math.max(0.6, duration - 0.5)}
                value={splitOffset}
                onChange={(e) => setSplitOffset(parseFloat(e.target.value) || 1)}
                className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-100 font-mono"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => onSplit(editedShot, splitOffset)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors whitespace-nowrap"
              >
                تقسيم اللقطة
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-800 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sticky bottom-0 bg-slate-900/95 backdrop-blur z-20">
          <button
            type="button"
            onClick={() => onDelete(editedShot.id)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-4 h-4" /> حذف اللقطة
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg text-xs transition-colors"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={() => onSave(editedShot)}
              className="flex-1 sm:flex-none px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg text-xs transition-colors shadow-sm"
            >
              حفظ التعديلات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
