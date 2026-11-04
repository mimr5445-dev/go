import React from 'react';
import { Shot, MusicSection } from '../types/studio';
import { Box, Sparkles, Volume2, Plus, Edit3, Trash2, ArrowRight } from 'lucide-react';

interface TimelineTrackProps {
  shots: Shot[];
  music: MusicSection[];
  totalDuration: number;
  currentGlobalTime: number;
  onTimeChange: (time: number) => void;
  selectedShotId: string | null;
  onSelectShot: (shotId: string) => void;
  onEditShot: (shot: Shot) => void;
  onAddShotAfter: (shot: Shot) => void;
}

const MOOD_COLORS: Record<string, string> = {
  hopeful: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300',
  tension: 'bg-rose-950/60 border-rose-500/40 text-rose-300',
  mystery: 'bg-purple-950/60 border-purple-500/40 text-purple-300',
  wonder: 'bg-amber-950/60 border-amber-500/40 text-amber-300',
  action: 'bg-orange-950/60 border-orange-500/40 text-orange-300',
  dark: 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300',
  epic: 'bg-red-950/60 border-red-500/40 text-red-300',
};

export const TimelineTrack: React.FC<TimelineTrackProps> = ({
  shots,
  music,
  totalDuration,
  currentGlobalTime,
  onTimeChange,
  selectedShotId,
  onSelectShot,
  onEditShot,
  onAddShotAfter,
}) => {
  const playheadPercent = Math.min(100, (currentGlobalTime / (totalDuration || 1)) * 100);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 flex flex-col gap-3 max-w-full overflow-hidden">
      {/* Timeline Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-100">الخط الزمني المتلاصق للمشاهد</h3>
          <span className="text-xs text-slate-400 font-mono" dir="ltr">
            ({shots.length} shots · {totalDuration.toFixed(2)}s)
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-500/80" />
            <span>نشطة</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-purple-500/60" />
            <span>لقطة 3D</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-cyan-500/60" />
            <span>مؤثر SFX</span>
          </span>
        </div>
      </div>

      {/* Main Shots Horizontal Track */}
      <div className="relative w-full max-w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 overflow-x-auto min-h-[90px] select-none" dir="ltr">
        {/* Playhead Vertical Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-30 pointer-events-none shadow-[0_0_8px_rgba(251,191,36,0.8)]"
          style={{ left: `${playheadPercent}%` }}
        >
          <div className="w-2.5 h-2.5 bg-amber-400 rotate-45 -ml-1 -mt-1 rounded-sm" />
        </div>

        {/* Shots Strip */}
        <div className="flex w-full min-w-[600px] sm:min-w-[720px] h-16 relative gap-0.5" dir="ltr">
          {shots.map((shot, idx) => {
            const shotDur = shot.end - shot.start;
            const widthPercent = (shotDur / (totalDuration || 1)) * 100;
            const isSelected = selectedShotId === shot.id;
            const isCurrent = currentGlobalTime >= shot.start && currentGlobalTime < shot.end;
            const is3D = shot.kind === '3d' || shot.scene.toLowerCase().includes('3d');
            const hasSFX = shot.sfx && shot.sfx.length > 0;

            return (
              <div
                key={shot.id}
                onClick={() => {
                  onSelectShot(shot.id);
                  onTimeChange(shot.start);
                }}
                onDoubleClick={() => onEditShot(shot)}
                style={{ width: `${widthPercent}%` }}
                className={`relative h-full rounded flex flex-col justify-between p-1.5 transition-all cursor-pointer border text-right overflow-hidden group ${
                  isSelected
                    ? 'border-amber-400 bg-amber-500/20 shadow-md ring-1 ring-amber-400/50'
                    : isCurrent
                    ? 'border-slate-500 bg-slate-800'
                    : 'border-slate-800/80 bg-slate-900/90 hover:bg-slate-850 hover:border-slate-700'
                }`}
                title={`لقطة ${shot.id} (${shot.start.toFixed(2)}ث -> ${shot.end.toFixed(
                  2
                )}ث): ${shot.scene}\nانقر مرتين للتعديل`}
              >
                {/* Top Row: ID, Duration, Tags */}
                <div className="flex items-center justify-between text-[10px] font-mono leading-none" dir="ltr">
                  <span
                    className={`font-bold ${
                      isSelected ? 'text-amber-300' : isCurrent ? 'text-slate-100' : 'text-slate-300'
                    }`}
                  >
                    {shot.id}
                  </span>
                  <span className="text-slate-400">{shotDur.toFixed(1)}s</span>
                </div>

                {/* Middle: Scene Name summary */}
                <div className="text-[11px] font-medium text-slate-200 truncate mt-1">
                  {shot.scene}
                </div>

                {/* Bottom Row: SFX cues & Transitions */}
                <div className="flex items-center justify-between text-[9px] text-slate-400 mt-auto" dir="ltr">
                  <div className="flex items-center gap-1">
                    {is3D && (
                      <span className="px-1 rounded bg-purple-500/30 text-purple-200 border border-purple-500/40">
                        3D
                      </span>
                    )}
                    {hasSFX && (
                      <span className="flex items-center text-cyan-300 font-mono">
                        <Volume2 className="w-2.5 h-2.5 mr-0.5" />
                        {shot.sfx?.length}
                      </span>
                    )}
                  </div>
                  {shot.in && shot.in.type !== 'cut' && (
                    <span className="text-amber-400/90 font-mono uppercase">{shot.in.type}</span>
                  )}
                </div>

                {/* Hover Quick Edit Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditShot(shot);
                  }}
                  className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 p-0.5 rounded bg-slate-950/80 text-amber-300 hover:text-white transition-opacity"
                  title="تعديل تفاصيل اللقطة"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Music Score Sections Lane */}
      <div className="flex flex-col gap-1.5 max-w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-1">
          <span className="font-semibold text-slate-300">مسار الموسيقى التصويرية التخليقية (audio/music.py)</span>
          <span className="font-mono text-[11px]">مقاطع مزاجية بتلاشٍ متداخل (Cross-fade 2s)</span>
        </div>
        <div className="flex w-full min-w-0 h-6 rounded bg-slate-950 border border-slate-800 overflow-hidden text-[10px] font-mono select-none" dir="ltr">
          {music.map((sec, i) => {
            const secDur = sec.end - sec.start;
            const wPct = (secDur / (totalDuration || 1)) * 100;
            const colorClass = MOOD_COLORS[sec.mood] || 'bg-slate-900 border-slate-700 text-slate-300';
            return (
              <div
                key={i}
                style={{ width: `${wPct}%` }}
                className={`h-full border-r flex items-center justify-between px-2 ${colorClass}`}
                title={`موسيقى: ${sec.mood} بكثافة ${sec.intensity} (${sec.start}ث - ${sec.end}ث)`}
              >
                <span className="font-bold truncate uppercase">{sec.mood}</span>
                <span className="opacity-75">{sec.intensity.toFixed(2)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

