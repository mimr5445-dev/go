import React, { useState } from 'react';
import { StoryShotsConfig, Shot } from '../types/studio';
import { X, Wand2, FileText, CheckCircle2 } from 'lucide-react';

interface ScriptToBeatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyBeats: (newConfig: StoryShotsConfig) => void;
}

export const ScriptToBeatsModal: React.FC<ScriptToBeatsModalProps> = ({
  isOpen,
  onClose,
  onApplyBeats,
}) => {
  const [scriptText, setScriptText] = useState<string>(
    `في البداية، كل شيء يبدو طبيعياً واعتيادياً تماماً.
ثم، فجأة تلاحظ أمراً خارقاً للعادة.
ذبابة تمر بسرعة أمام وجهك بالحركة العادية.
أنت لا تفكر حتى في الأمر.
يدك تتحرك بسرعة خاطفة، وتمسك بها في الهواء!
صديقك ينظر إليك بدهشة واستغراب تام.
"كيف استطعت فعل ذلك بتلك السرعة؟"
رد الفعل البشري الطبيعي يستغرق ربع ثانية كاملة.
لكنك استجبت في 25 جزءاً من الألف من الثانية فقط!
ماذا لو كانت سرعة رد فعلك أسرع بعشر مرات؟
إليك كيف يعمل هذا علمياً داخل جسمك:
عيناك تلتقطان المشهد، عقلك يحلل ويقرر، وعضلاتك تتحرك فوراً.`
  );
  const [projectTitle, setProjectTitle] = useState('سرعة رد الفعل الخارقة (10x Faster)');
  const [targetBeatSec, setTargetBeatSec] = useState(3.0);
  const [leadSec, setLeadSec] = useState(0.15);
  const [tailSec, setTailSec] = useState(1.5);
  const [estimatedSpeechRateWPM, setEstimatedSpeechRateWPM] = useState(140);

  if (!isOpen) return null;

  const handleGenerateBeats = () => {
    // Break script into sentences & phrases
    const lines = scriptText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const phrases: string[] = [];
    lines.forEach((line) => {
      // Split on strong punctuation (. ! ? ...)
      const parts = line.split(/(?<=[.?!…؛،])\s+/);
      parts.forEach((p) => {
        if (p.trim().length > 0) phrases.push(p.trim());
      });
    });

    // Approximate timings if not SRT
    let currentT = 0;
    const secPerWord = 60 / estimatedSpeechRateWPM;
    const generatedShots: Shot[] = [];

    phrases.forEach((ph, i) => {
      const words = ph.split(/\s+/).length;
      let rawDur = Math.max(1.4, words * secPerWord);
      // Clamp near target
      rawDur = Math.round(rawDur * 10) / 10;
      const start = currentT === 0 ? 0 : Math.max(0, currentT - (i > 0 ? leadSec : 0));
      const end = Math.round((start + rawDur) * 100) / 100;
      currentT = end;

      generatedShots.push({
        id: `s${String(i + 1).padStart(3, '0')}`,
        start,
        end,
        line: ph,
        scene: i === 0 ? 'مشهد افتتاحي عام' : i === 1 ? 'لقطة متوسطة ورد فعل الشخصية' : 'حركة سينمائية وتفسير علمي',
        set: i === 0 ? 'cafe' : 'blueprint',
        bars: null,
        in: { type: i === 0 ? 'cut' : i % 3 === 0 ? 'whip' : 'cut' },
        sfx: i === 0 ? [{ at: 0.4, name: 'whoosh', gain: -10 }] : [],
      });
    });

    // Align perfectly contiguous
    let runningStart = 0;
    const contiguousShots = generatedShots.map((s) => {
      const d = Math.max(0.8, s.end - s.start);
      const aligned = {
        ...s,
        start: runningStart,
        end: Math.round((runningStart + d) * 100) / 100,
      };
      runningStart = aligned.end;
      return aligned;
    });

    const totalDur = runningStart + tailSec;

    const newConfig: StoryShotsConfig = {
      title: projectTitle,
      duration: Math.round(totalDur * 100) / 100,
      shots: contiguousShots,
      music: [
        { start: 0, end: Math.round(totalDur * 0.3), mood: 'hopeful', intensity: 0.5 },
        { start: Math.round(totalDur * 0.3), end: Math.round(totalDur * 0.7), mood: 'tension', intensity: 0.65 },
        { start: Math.round(totalDur * 0.7), end: totalDur, mood: 'wonder', intensity: 0.75 },
      ],
    };

    onApplyBeats(newConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-semibold text-slate-100">توليد اللقطات والنبضات من السيناريو (tools/beats.py)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs text-slate-300">
          <div>
            <label className="block text-slate-400 font-medium mb-1">عنوان المشروع</label>
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-medium focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">
              نص السيناريو والتعليق الصوتي (Voiceover Script)
            </label>
            <p className="text-slate-500 text-[11px] mb-2 leading-relaxed">
              الصق نص التعليق الصوتي. تقوم الأداة بتقسيم الجمل آلياً عند علامات الترقيم (. ! ؟ ...) إلى نبضات متلاصقة حتمياً بدون أي فراغات زمنية.
            </p>
            <textarea
              rows={8}
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 font-sans leading-relaxed focus:outline-none focus:border-amber-500 text-xs"
            />
          </div>

          {/* Beat Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div>
              <label className="block text-slate-400 font-medium mb-1">طول النبضة المستهدف</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.5"
                  value={targetBeatSec}
                  onChange={(e) => setTargetBeatSec(parseFloat(e.target.value) || 3.0)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-mono"
                  dir="ltr"
                />
                <span className="text-slate-500 font-mono">s</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">سرعة الإلقاء (WPM)</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="10"
                  value={estimatedSpeechRateWPM}
                  onChange={(e) => setEstimatedSpeechRateWPM(parseInt(e.target.value) || 140)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-mono"
                  dir="ltr"
                />
                <span className="text-slate-500 font-mono">wpm</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">هامش الهدوء النهائي</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  value={tailSec}
                  onChange={(e) => setTailSec(parseFloat(e.target.value) || 1.5)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-mono"
                  dir="ltr"
                />
                <span className="text-slate-500 font-mono">s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3 sticky bottom-0 bg-slate-900/95 backdrop-blur">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg text-xs transition-colors"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleGenerateBeats}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg text-xs transition-colors shadow-sm"
          >
            <Wand2 className="w-3.5 h-3.5" /> توليد shots.json المتلاصق
          </button>
        </div>
      </div>
    </div>
  );
};
