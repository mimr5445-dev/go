import React, { useState, useMemo } from 'react';
import {
  StoryShotsConfig,
  Shot,
  VisualStyleId,
  AspectRatio,
  ProjectConfig,
} from './types/studio';
import {
  REACTION_TIME_PROJECT,
  DEFAULT_CONFIG,
  CAST_DEFINITIONS,
  TEMPLATE_PROJECTS,
} from './data/defaultProject';
import { validateShots, autoAlignShots } from './utils/invariantValidator';
import { ViewportPlayer } from './components/ViewportPlayer';
import { TimelineTrack } from './components/TimelineTrack';
import { ValidationBanner } from './components/ValidationBanner';
import { ShotEditorModal } from './components/ShotEditorModal';
import { ScriptToBeatsModal } from './components/ScriptToBeatsModal';
import { JsonCodeDrawer } from './components/JsonCodeDrawer';
import { audioSynth } from './engine/audioSynth';
import {
  Film,
  Sparkles,
  Volume2,
  Wand2,
  Code2,
  Plus,
  Play,
  RotateCcw,
  Check,
  Palette,
  Users,
  MapPin,
  Music,
  BookOpen,
} from 'lucide-react';

export default function App() {
  const [projectConfig, setProjectConfig] = useState<ProjectConfig>(DEFAULT_CONFIG);
  const [shotsConfig, setShotsConfig] = useState<StoryShotsConfig>(REACTION_TIME_PROJECT);
  const [currentGlobalTime, setCurrentGlobalTime] = useState<number>(0);
  const [selectedShotId, setSelectedShotId] = useState<string | null>('s001');
  const [editingShot, setEditingShot] = useState<Shot | null>(null);

  // Modals & Panels
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [isCodeDrawerOpen, setIsCodeDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'director' | 'bible' | 'sound' | 'styles'>('director');

  // Validate invariants on every state change
  const validationResult = useMemo(() => {
    return validateShots(shotsConfig);
  }, [shotsConfig]);

  // Handle Shot Updates
  const handleSaveShot = (updatedShot: Shot) => {
    const updatedShots = shotsConfig.shots.map((s) => (s.id === updatedShot.id ? updatedShot : s));
    setShotsConfig({
      ...shotsConfig,
      shots: updatedShots,
    });
    setEditingShot(null);
  };

  // Handle Split Shot into Two Contiguous Shots
  const handleSplitShot = (shot: Shot, splitOffsetSec: number) => {
    const splitPoint = Math.round((shot.start + splitOffsetSec) * 100) / 100;
    const shotIdx = shotsConfig.shots.findIndex((s) => s.id === shot.id);
    if (shotIdx < 0) return;

    const firstHalf: Shot = {
      ...shot,
      end: splitPoint,
    };

    const nextIdNum = shotsConfig.shots.length + 1;
    const secondHalf: Shot = {
      id: `s${String(nextIdNum).padStart(3, '0')}`,
      start: splitPoint,
      end: shot.end,
      line: '',
      scene: `${shot.scene} (continued)`,
      set: shot.set,
      bars: shot.bars,
      in: { type: 'cut' },
      sfx: [],
    };

    const newShots = [...shotsConfig.shots];
    newShots.splice(shotIdx, 1, firstHalf, secondHalf);

    setShotsConfig({
      ...shotsConfig,
      shots: newShots,
    });
    setEditingShot(null);
  };

  // Handle Delete Shot
  const handleDeleteShot = (shotId: string) => {
    if (shotsConfig.shots.length <= 1) return;
    const updated = shotsConfig.shots.filter((s) => s.id !== shotId);
    // Auto align remaining to maintain contiguity
    const aligned = autoAlignShots({ ...shotsConfig, shots: updated });
    setShotsConfig(aligned);
    setEditingShot(null);
  };

  // One-click Auto Align
  const handleAutoAlign = () => {
    const aligned = autoAlignShots(shotsConfig);
    setShotsConfig(aligned);
  };

  // Add a new shot at the end
  const handleAddShotAtEnd = () => {
    const last = shotsConfig.shots[shotsConfig.shots.length - 1];
    const newStart = last ? last.end : 0;
    const newEnd = Math.round((newStart + 3.0) * 100) / 100;
    const nextId = `s${String(shotsConfig.shots.length + 1).padStart(3, '0')}`;

    const newShot: Shot = {
      id: nextId,
      start: newStart,
      end: newEnd,
      line: 'New voiceover sentence line here.',
      scene: 'Action scene description',
      set: 'cafe',
      bars: null,
      in: { type: 'cut' },
      sfx: [{ at: 0.3, name: 'pop', gain: -10 }],
    };

    setShotsConfig({
      ...shotsConfig,
      duration: newEnd,
      shots: [...shotsConfig.shots, newShot],
    });
    setSelectedShotId(nextId);
    setCurrentGlobalTime(newStart);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Contract: Zone 1 (Brand) - Zone 2 (Nav Links) - Zone 3 (1 Primary Action) */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-40">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 shadow-md">
            <Film className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-slate-100 whitespace-nowrap">
              aiTrends 2D Studio
            </span>
            <span className="text-[10px] text-amber-400 font-medium">مخرج المشاهد والخط الزمني</span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (single-line, concise) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('director')}
            className={`transition-colors whitespace-nowrap ${
              activeTab === 'director' ? 'text-amber-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            المخرج والخط الزمني
          </button>
          <button
            onClick={() => setActiveTab('bible')}
            className={`transition-colors whitespace-nowrap ${
              activeTab === 'bible' ? 'text-amber-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            دليل القصة والشخصيات
          </button>
          <button
            onClick={() => setActiveTab('sound')}
            className={`transition-colors whitespace-nowrap ${
              activeTab === 'sound' ? 'text-amber-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            المؤثرات الصوتية (36 SFX)
          </button>
          <button
            onClick={() => setActiveTab('styles')}
            className={`transition-colors whitespace-nowrap ${
              activeTab === 'styles' ? 'text-amber-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            الأنماط البصرية
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsCodeDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors shadow-sm whitespace-nowrap"
          >
            <Code2 className="w-3.5 h-3.5" />
            تصدير shots.json
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto p-4 md:p-6 space-y-5">
        {/* Sub-header Context Bar with Project Switcher & Tools */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium">المشروع الحالي:</span>
            <select
              value={shotsConfig.title}
              onChange={(e) => {
                const selected = Object.values(TEMPLATE_PROJECTS).find((p) => p.title === e.target.value);
                if (selected) {
                  setShotsConfig(selected);
                  setCurrentGlobalTime(0);
                  setSelectedShotId('s001');
                }
              }}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1 font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="What If Your Reaction Time Was 10x Faster?">
                سرعة رد الفعل (14 لقطة - المشروع المرجعي)
              </option>
              <option value="What If You Stopped Sleeping for 7 Days?">
                7 أيام دون نوم (7 لقطات)
              </option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsScriptModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors border border-slate-700/50"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-400" />
              تحويل النص إلى لقطات (Beats)
            </button>
            <button
              onClick={handleAddShotAtEnd}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors border border-slate-700/50"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              إضافة لقطة
            </button>
          </div>
        </div>

        {/* Invariant Health Banner */}
        <ValidationBanner validation={validationResult} onAutoAlign={handleAutoAlign} />

        {/* Tab 1: Director & Visual Timeline */}
        {activeTab === 'director' && (
          <div className="space-y-5">
            {/* Viewport Canvas Player */}
            <ViewportPlayer
              shots={shotsConfig.shots}
              totalDuration={shotsConfig.duration}
              currentGlobalTime={currentGlobalTime}
              onTimeChange={setCurrentGlobalTime}
              styleId={projectConfig.style}
              onStyleChange={(st) => setProjectConfig({ ...projectConfig, style: st })}
              aspect={projectConfig.aspect}
              onAspectChange={(asp) => setProjectConfig({ ...projectConfig, aspect: asp })}
            />

            {/* Contiguous Interactive Timeline Track */}
            <TimelineTrack
              shots={shotsConfig.shots}
              music={shotsConfig.music}
              totalDuration={shotsConfig.duration}
              currentGlobalTime={currentGlobalTime}
              onTimeChange={setCurrentGlobalTime}
              selectedShotId={selectedShotId}
              onSelectShot={setSelectedShotId}
              onEditShot={(s) => setEditingShot(s)}
              onAddShotAfter={(s) => {
                setEditingShot(s);
              }}
            />

            {/* Quick Shot List Table with Exact Contiguity Invariant */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-100 text-sm">
                  جدول اللقطات ومصفوفة الثوابت الرياضية (story/shots.json)
                </h3>
                <span className="text-xs text-slate-400 font-mono" dir="ltr">
                  قاعدة التلاصق: end[i] = start[i+1]
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                      <th className="py-2 px-3 text-right">المعرّف</th>
                      <th className="py-2 px-3 text-right">البداية</th>
                      <th className="py-2 px-3 text-right">النهاية</th>
                      <th className="py-2 px-3 text-right">المدة</th>
                      <th className="py-2 px-3 text-right">الانتقال</th>
                      <th className="py-2 px-3 text-right">الأشرطة</th>
                      <th className="py-2 px-3 text-right">مؤثرات SFX</th>
                      <th className="py-2 px-3 font-sans text-right">التعليق الصوتي ووصف المشهد</th>
                      <th className="py-2 px-3 text-left">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {shotsConfig.shots.map((s, idx) => {
                      const dur = s.end - s.start;
                      const isSelected = selectedShotId === s.id;
                      const nextShot = shotsConfig.shots[idx + 1];
                      const isDiscontinuous = nextShot && Math.abs(s.end - nextShot.start) > 0.01;

                      return (
                        <tr
                          key={s.id}
                          onClick={() => {
                            setSelectedShotId(s.id);
                            setCurrentGlobalTime(s.start);
                          }}
                          className={`hover:bg-slate-800/50 cursor-pointer transition-colors ${
                            isSelected ? 'bg-amber-500/10' : ''
                          } ${isDiscontinuous ? 'bg-rose-500/10' : ''}`}
                        >
                          <td className="py-2.5 px-3 font-bold text-amber-400" dir="ltr">{s.id}</td>
                          <td className="py-2.5 px-3 text-slate-300" dir="ltr">{s.start.toFixed(2)}s</td>
                          <td className={`py-2.5 px-3 ${isDiscontinuous ? 'text-rose-400 font-bold' : 'text-slate-300'}`} dir="ltr">
                            {s.end.toFixed(2)}s
                          </td>
                          <td className="py-2.5 px-3 text-slate-400" dir="ltr">{dur.toFixed(2)}s</td>
                          <td className="py-2.5 px-3 uppercase text-slate-400">{s.in?.type || 'cut'}</td>
                          <td className="py-2.5 px-3 text-slate-400">{s.bars || 'wide'}</td>
                          <td className="py-2.5 px-3 text-cyan-300">
                            {s.sfx && s.sfx.length > 0 ? (
                              <span className="flex items-center gap-1">
                                <Volume2 className="w-3 h-3" />
                                <span dir="ltr">{s.sfx.map((c) => c.name).join(', ')}</span>
                              </span>
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-sans max-w-xs truncate text-slate-200">
                            <span className="font-medium text-slate-100">{s.scene}</span>
                            {s.line && <span className="text-slate-400 block text-[11px] truncate">"{s.line}"</span>}
                          </td>
                          <td className="py-2.5 px-3 text-left">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingShot(s);
                              }}
                              className="px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded text-[11px] transition-colors"
                            >
                              تعديل
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Story Bible & Character Cast */}
        {activeTab === 'bible' && (
          <div className="space-y-5">
            {/* Cast Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold text-slate-100 text-sm">
                  طاقم الشخصيات وتصميم الملابس (scenes/cast.js)
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(CAST_DEFINITIONS).map(([key, char]) => (
                  <div
                    key={key}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-bold text-amber-400 text-sm">{key}</span>
                        <span className="text-xs text-slate-400 font-medium">
                          {char.role === 'Hero' ? 'البطل الرئيسي' : char.role === 'Best Friend' ? 'الصديق المقرّب' : 'العالِم والباحث'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mb-3">
                        العنصر المميّز:{' '}
                        <strong className="text-slate-100 font-semibold">
                          {char.signature === 'Red Hoodie' ? 'هودي أحمر دافئ' : char.signature === 'Yellow Cap' ? 'قبعة بيسبول صفراء' : 'معطف مختبر أبيض ونظارة'}
                        </strong>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                      <div>الرداء العلوي: <span className="font-mono text-slate-300">{char.outfit.top || 'none'}</span></div>
                      <div>غطاء الرأس: <span className="font-mono text-slate-300">{char.outfit.head || 'none'}</span></div>
                      {char.outfit.face && <div>إكسسوار الوجه: <span className="font-mono text-slate-300">{char.outfit.face}</span></div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Set Environments */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold text-slate-100 text-sm">
                  هندسة البيئات والمواقع (scenes/sets/*.js)
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-semibold text-amber-300">المقهى الخارجي (scenes/sets/cafe.js)</h4>
                  <p className="text-slate-400 leading-relaxed">
                    المزاج: <strong>golden</strong>. شمس غاربة منخفضة على اليمين، ظلال مباني الأفق، مظلة قماشية مخططة، رصيف مشاة، طاولة مستديرة وكوب قهوة دافئ.
                  </p>
                  <span className="text-[11px] text-slate-500 font-mono block" dir="ltr">الإضاءة الرئيسية: Window / Sun [0, -1]</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-semibold text-amber-300">مختبر الأبحاث (scenes/sets/lab.js)</h4>
                  <p className="text-slate-400 leading-relaxed">
                    المزاج: <strong>interiorWarm</strong>. نافذة المختبر تطل على شفق المساء، لوحة جدارية توضيحية (عين ← دماغ ← عضلات)، شاشات حواسيب وعدادات علمية.
                  </p>
                  <span className="text-[11px] text-slate-500 font-mono block" dir="ltr">الإضاءة الرئيسية: Practical overhead / Screen</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-semibold text-amber-300">المخطط الشبكي الفضائي (engine/ui2d.js)</h4>
                  <p className="text-slate-400 leading-relaxed">
                    المزاج: <strong>void</strong>. خلفية شبكية كحلية عميقة، رسوم متجهة باللون السيان الفاتح، أشرطة قياس رقمية متحركة تقارن الأزمنة والسرعات بدقة.
                  </p>
                  <span className="text-[11px] text-slate-500 font-mono block" dir="ltr">الإضاءة الرئيسية: Self-illuminating UI vectors</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Sound & 36 SFX Library */}
        {activeTab === 'sound' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-cyan-400" />
                <h3 className="font-semibold text-slate-100 text-sm">
                  مكتبة المؤثرات الصوتية التخليقية (audio/sfx.py)
                </h3>
              </div>
              <span className="text-xs text-slate-400">36 مؤثراً صوتياً إجرائياً (انقر للاستماع والمطابقة)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
              {[
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
              ].map((sfxName) => (
                <button
                  key={sfxName}
                  onClick={() => audioSynth.playSFX(sfxName, -8)}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850 transition-colors text-right group"
                >
                  <span className="font-mono text-slate-300 group-hover:text-cyan-300" dir="ltr">{sfxName}</span>
                  <Play className="w-3 h-3 text-slate-500 group-hover:text-cyan-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Visual Styles */}
        {activeTab === 'styles' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-slate-100 text-sm">
                الأنماط البصرية الـ 5 المعتمدة (engine/styles.js)
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div
                onClick={() => setProjectConfig({ ...projectConfig, style: 'dusk' })}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  projectConfig.style === 'dusk'
                    ? 'border-amber-400 bg-amber-500/10'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-semibold mb-1">
                  <span className="text-amber-300">الغسق السينمائي (Cinematic Dusk)</span>
                  {projectConfig.style === 'dusk' && <Check className="w-4 h-4 text-amber-400" />}
                </div>
                <p className="text-slate-400 leading-relaxed">
                  المظهر المرجعي: ظلال بنفسجية دافئة، إضاءة ذهبية محورية، إضاءة حافة بلون الكريمة، تحبيب فيلمي ناعم، أشرطة سينمائية 2:1.
                </p>
              </div>

              <div
                onClick={() => setProjectConfig({ ...projectConfig, style: 'midnight' })}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  projectConfig.style === 'midnight'
                    ? 'border-amber-400 bg-amber-500/10'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-semibold mb-1">
                  <span className="text-cyan-300">زرقة منتصف الليل (Midnight Blue)</span>
                  {projectConfig.style === 'midnight' && <Check className="w-4 h-4 text-amber-400" />}
                </div>
                <p className="text-slate-400 leading-relaxed">
                  عالم كحلي بارد، إضاءة حافة زرقاء مبيضة، مصابيح شوارع بلون الصوديوم البرتقالي، ملائم للمطر والتباين المرتفع.
                </p>
              </div>

              <div
                onClick={() => setProjectConfig({ ...projectConfig, style: 'golden' })}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  projectConfig.style === 'golden'
                    ? 'border-amber-400 bg-amber-500/10'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-semibold mb-1">
                  <span className="text-amber-400">الساعة الذهبية (Golden Hour)</span>
                  {projectConfig.style === 'golden' && <Check className="w-4 h-4 text-amber-400" />}
                </div>
                <p className="text-slate-400 leading-relaxed">
                  إضاءة نهارية دافئة بلون البرتقالي والتيل، وهج شمس واسع، درجات متوسطة أكثر نصوعاً، إضاءة حافة كريمية دافئة.
                </p>
              </div>

              <div
                onClick={() => setProjectConfig({ ...projectConfig, style: 'neon' })}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  projectConfig.style === 'neon'
                    ? 'border-amber-400 bg-amber-500/10'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-semibold mb-1">
                  <span className="text-fuchsia-300">نيون نوار (Neon Noir)</span>
                  {projectConfig.style === 'neon' && <Check className="w-4 h-4 text-amber-400" />}
                </div>
                <p className="text-slate-400 leading-relaxed">
                  سواديّات ليلية عميقة، إضاءات حواف ثنائية بلون التيل والماجنتا، لافتات متوهجة وبلوم نيون قوي.
                </p>
              </div>

              <div
                onClick={() => setProjectConfig({ ...projectConfig, style: 'storybook' })}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  projectConfig.style === 'storybook'
                    ? 'border-amber-400 bg-amber-500/10'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-semibold mb-1">
                  <span className="text-indigo-300">قصة كرتونية ناعمة (Soft Storybook)</span>
                  {projectConfig.style === 'storybook' && <Check className="w-4 h-4 text-amber-400" />}
                </div>
                <p className="text-slate-400 leading-relaxed">
                  ألوان باستيل هادئة، تباين لطيف، ظلال خزامى ناعمة، ملمس ورقي رقيق — أجواء ودودة تناسب السرد القصصي العائلي.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Edit Shot Modal */}
      {editingShot && (
        <ShotEditorModal
          shot={editingShot}
          isOpen={true}
          onClose={() => setEditingShot(null)}
          onSave={handleSaveShot}
          onSplit={handleSplitShot}
          onDelete={handleDeleteShot}
        />
      )}

      {/* Script to Beats Modal */}
      <ScriptToBeatsModal
        isOpen={isScriptModalOpen}
        onClose={() => setIsScriptModalOpen(false)}
        onApplyBeats={(cfg) => {
          setShotsConfig(cfg);
          setCurrentGlobalTime(0);
          setSelectedShotId('s001');
        }}
      />

      {/* Code Export Drawer */}
      <JsonCodeDrawer
        isOpen={isCodeDrawerOpen}
        onClose={() => setIsCodeDrawerOpen(false)}
        config={shotsConfig}
        projectConfig={projectConfig}
      />
    </div>
  );
}
