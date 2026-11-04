import React, { useState } from 'react';
import { StoryShotsConfig, ProjectConfig } from '../types/studio';
import { CAST_DEFINITIONS } from '../data/defaultProject';
import { X, Copy, Check, Download, Code2, FileText, CheckCircle2 } from 'lucide-react';

interface JsonCodeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config: StoryShotsConfig;
  projectConfig: ProjectConfig;
}

type TabType = 'shots.json' | 'bible.md' | 'cast.js' | 'config.json' | 'shot_example.js';

export const JsonCodeDrawer: React.FC<JsonCodeDrawerProps> = ({
  isOpen,
  onClose,
  config,
  projectConfig,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('shots.json');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate file contents
  const shotsJsonContent = JSON.stringify(config, null, 2);

  const bibleMdContent = `# Story Bible — "${config.title}"
Logline: Second-person narrative explainer. Tone: wonder, tension, cinematic science.

## Cast
| ID | Role | Outfit | Signature | Expressions |
|---|---|---|---|---|
| MAX | Hero | hoodie #d64a33, no hat | Red Hoodie | neutral, surprised, determined, smirk, thinking |
| JAKE | Best Friend | blue tee, yellow cap #f2c21a | Yellow Cap | happy, scared, shocked, surprised |
| DOC | Scientist | lab coat + round glasses | White Coat | smile, talk, point |

## Locations (Sets)
- cafe (golden): Street cafe facade, warm windows, low sun, table and coffee cup.
- lab (interiorWarm): Lab window with skyline, wall board (eye -> brain -> muscle), counter.
- blueprint (void): Navy grid, cyan diagrams, gold readouts.

## Music Plan
${config.music.map((m) => `- ${m.start}s - ${m.end}s: ${m.mood} (intensity ${m.intensity})`).join('\n')}
`;

  const castJsContent = `// scenes/cast.js — Exact character outfits for aitrends-2d-studio
export const MAX = { top: 'hoodie', color: '#d64a33', head: 'none' };
export const JAKE = { top: 'tshirt', color: '#3a6ea5', head: 'cap', headColor: '#f2c21a' };
export const DOC = { top: 'labcoat', face: 'glasses', head: 'none' };
export const CAST = [MAX, JAKE, DOC];
`;

  const projectConfigContent = JSON.stringify(
    {
      ...projectConfig,
      title: config.title,
      duration: config.duration,
    },
    null,
    2
  );

  const shotExampleJs = `// scenes/shots/01_example.js — Procedural shot script
import { E, V, registerShot, mood, layer, blurLayer, veil, ease, prog } from '/engine/core.js';
import { drawFigure, POSES, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { MAX, JAKE } from '../cast.js';

registerShot('${config.shots[0]?.id || 's001'}', {
  draw(g, t, info) {
    const M = mood('golden');
    const cam = { z: 1 + 0.06 * ease.inOut(t / info.dur) };
    
    // Background layer with parallax
    layer(g, cam, 0.2, (cg) => {
      FX.sun(cg, E.W * 0.7, E.H * 0.4, 60, '#fff3dc', M.key);
      FX.skyline(cg, { y: E.H * 0.7, color: '#1a1828' });
    });

    // Character plane (depth 1.0)
    layer(g, cam, 1.0, (cg) => {
      const GY = E.H * V(0.8, 0.68);
      drawFigure(cg, {
        x: E.W * 0.45,
        y: GY,
        s: V(1.5, 1.6),
        facing: 1,
        outfit: MAX,
        pose: breathe(POSES.relaxed, t),
        expr: 'neutral',
        rim: { color: M.rim, dir: [0, -1] }
      });
    });

    FX.dust(g, t, { count: 30 });
  }
});
`;

  const getCurrentContent = () => {
    switch (activeTab) {
      case 'shots.json':
        return shotsJsonContent;
      case 'bible.md':
        return bibleMdContent;
      case 'cast.js':
        return castJsContent;
      case 'config.json':
        return projectConfigContent;
      case 'shot_example.js':
        return shotExampleJs;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCurrentContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = getCurrentContent();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeTab;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto overflow-x-hidden overscroll-contain">
      <div className="bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl w-full max-w-3xl dialog-shell overflow-hidden shadow-2xl flex flex-col my-auto">
        {/* Drawer Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900 sticky top-0 z-20">
          <div className="flex items-center gap-2 min-w-0">
            <Code2 className="w-5 h-5 text-amber-400 shrink-0" />
            <h2 className="text-sm sm:text-base font-semibold text-slate-100 truncate">تصدير ملفات المشروع وإعداداته (Studio Exports)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-1 sm:gap-2 px-3 sm:px-6 pt-2.5 sm:pt-3 border-b border-slate-800/80 bg-slate-950 overflow-x-auto text-xs shrink-0" dir="ltr">
          <button
            onClick={() => setActiveTab('shots.json')}
            className={`px-3 py-2 border-b-2 font-mono font-medium transition-colors max-w-full whitespace-normal sm:whitespace-nowrap text-center sm:text-start ${
              activeTab === 'shots.json'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            story/shots.json (الحقيقة الثابتة)
          </button>
          <button
            onClick={() => setActiveTab('bible.md')}
            className={`px-3 py-2 border-b-2 font-mono font-medium transition-colors max-w-full whitespace-normal sm:whitespace-nowrap text-center sm:text-start ${
              activeTab === 'bible.md'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            story/bible.md
          </button>
          <button
            onClick={() => setActiveTab('cast.js')}
            className={`px-3 py-2 border-b-2 font-mono font-medium transition-colors max-w-full whitespace-normal sm:whitespace-nowrap text-center sm:text-start ${
              activeTab === 'cast.js'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            scenes/cast.js
          </button>
          <button
            onClick={() => setActiveTab('config.json')}
            className={`px-3 py-2 border-b-2 font-mono font-medium transition-colors max-w-full whitespace-normal sm:whitespace-nowrap text-center sm:text-start ${
              activeTab === 'config.json'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            config.json
          </button>
          <button
            onClick={() => setActiveTab('shot_example.js')}
            className={`px-3 py-2 border-b-2 font-mono font-medium transition-colors max-w-full whitespace-normal sm:whitespace-nowrap text-center sm:text-start ${
              activeTab === 'shot_example.js'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            scenes/shots/example.js
          </button>
        </div>

        {/* Code Content */}
        <div className="p-3.5 sm:p-6 flex-1 min-h-0 overflow-y-auto overflow-x-auto overscroll-contain bg-slate-950 font-mono text-xs text-slate-300 select-all" dir="ltr">
          <pre className="whitespace-pre-wrap leading-relaxed">{getCurrentContent()}</pre>
        </div>

        {/* Drawer Footer Actions */}
        <div className="px-4 sm:px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-slate-800 bg-slate-900 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          <span className="text-[11px] sm:text-xs text-slate-400">
            يمكنك نسخ هذه الملفات مباشرة إلى <code className="text-amber-400 font-mono" dir="ltr">aitrends-2d-studio/projects/&lt;slug&gt;/</code>
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'تم النسخ بنجاح!' : 'نسخ الكود'}
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" /> تحميل الملف
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

