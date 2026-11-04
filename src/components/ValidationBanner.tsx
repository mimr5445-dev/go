import React from 'react';
import { InvariantCheckResult } from '../types/studio';
import { CheckCircle2, AlertTriangle, AlertCircle, Wand2, Clock, Volume2, Box } from 'lucide-react';

interface ValidationBannerProps {
  validation: InvariantCheckResult;
  onAutoAlign: () => void;
}

export const ValidationBanner: React.FC<ValidationBannerProps> = ({
  validation,
  onAutoAlign,
}) => {
  const { valid, errors, warnings, stats } = validation;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 max-w-full overflow-hidden">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
        {/* مؤشر الحالة */}
        <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
          {valid ? (
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            </div>
          ) : (
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h3 className="font-semibold text-slate-100 text-xs sm:text-sm">
                {valid ? 'تسلسل اللقطات متوافق تماماً مع الثوابت الرياضية (100% Contiguous)' : 'تنبيه: تم اكتشاف أخطاء في تتابع التوقيت'}
              </h3>
              <span className="text-[11px] text-slate-400 font-mono" dir="ltr">
                {stats.totalShots} shots · {stats.duration.toFixed(2)}s
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 leading-relaxed">
              {valid
                ? 'جميع اللقطات متلاصقة حتمياً بدون أي فجوات (نهاية كل لقطة = بداية التالية)، ومتطابقة مع مسار الصوت.'
                : `يوجد ${errors.length} خطأ في تسلسل التوقيت يجب معالجته لمنع حدوث إطارات مفقودة أو ارتباك في الرندر.`}
            </p>
          </div>
        </div>

        {/* الإحصائيات وزر الإصلاح التلقائي */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full md:w-auto justify-between md:justify-end pt-1 sm:pt-0 border-t md:border-t-0 border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1 font-mono text-[11px]" dir="ltr">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> {stats.medianLength}s وسيط
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="flex items-center gap-1 font-mono text-[11px]" dir="ltr">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> {stats.sfxCount} مؤثراً SFX
            </span>
            {stats.has3d && (
              <>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="flex items-center gap-1 font-mono text-[11px] text-purple-300">
                  <Box className="w-3.5 h-3.5" /> مدار 3D
                </span>
              </>
            )}
          </div>

          {!valid && (
            <button
              onClick={onAutoAlign}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors shadow-sm shrink-0 w-full sm:w-auto"
              title="إصلاح التلاصق الزمني لكل اللقطات تلقائياً"
            >
              <Wand2 className="w-3.5 h-3.5" />
              إصلاح التلاصق تلقائياً
            </button>
          )}
        </div>
      </div>

      {/* قائمة الأخطاء */}
      {errors.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5">
          {errors.map((err, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-rose-300">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1 shrink-0" />
              <span>{err}</span>
            </div>
          ))}
        </div>
      )}

      {/* قائمة التنبيهات والإيقاع */}
      {warnings.length > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-800/50 space-y-1">
          {warnings.slice(0, 3).map((w, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-amber-300/90">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>{w}</span>
            </div>
          ))}
          {warnings.length > 3 && (
            <span className="text-xs text-slate-400 block pr-5">
              +{warnings.length - 3} تنبيهات إضافية تتعلق بالإيقاع أو توقيت المؤثرات
            </span>
          )}
        </div>
      )}
    </div>
  );
};
