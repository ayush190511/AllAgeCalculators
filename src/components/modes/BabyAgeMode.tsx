import React, { useState, useMemo } from 'react';
import { calculateAgeBreakdown, calculateDateDifference, formatDateForInput } from '../../lib/date-utils';
import { DateInputField } from '../DateInputField';
import { Baby, Calendar, Sparkles, Copy, Check, Clock } from 'lucide-react';

interface BabyAgeModeProps {
  title?: string;
  subtitle?: string;
}

export const BabyAgeMode: React.FC<BabyAgeModeProps> = ({ title, subtitle }) => {
  const [dob, setDob] = useState<string>('');
  const [timeStr, setTimeStr] = useState<string>('07:15');
  const [isPremature, setIsPremature] = useState<boolean>(false);
  const [gestationalWeeks, setGestationalWeeks] = useState<number>(34); // Born at 34 weeks
  const [copied, setCopied] = useState<boolean>(false);

  const today = useMemo(() => new Date(), []);

  const parsedDob = useMemo(() => {
    if (!dob) return null;
    const [y, m, d] = dob.split('-').map(Number);
    const [h, min] = timeStr.split(':').map(Number);
    return new Date(y, m - 1, d, h || 0, min || 0);
  }, [dob, timeStr]);

  const ageData = useMemo(() => {
    if (!parsedDob) return null;
    return calculateAgeBreakdown(parsedDob, today);
  }, [parsedDob, today]);

  // Gestational Corrected Age (Subtract weeks premature from actual age)
  const correctedAgeWeeks = useMemo(() => {
    if (!isPremature || !ageData) return null;
    const prematureWeeks = Math.max(0, 40 - gestationalWeeks);
    const actualWeeks = ageData.totalWeeks;
    const correctedWeeks = Math.max(0, actualWeeks - prematureWeeks);
    const correctedMonths = Math.floor(correctedWeeks / 4.345);
    return { prematureWeeks, correctedWeeks, correctedMonths };
  }, [isPremature, gestationalWeeks, ageData]);

  const handleCopySummary = () => {
    if (!ageData) return;
    const text = `👶 Baby Age Calculator Summary
📅 Date of Birth: ${dob} at ${timeStr}
🍼 Exact Age: ${ageData.months} Months, ${ageData.days} Days (${ageData.years} Yrs)
📆 Age in Weeks: ${ageData.totalWeeks} Weeks, ${ageData.days % 7} Days
🔢 Total Days: ${ageData.totalDays.toLocaleString()} Days
${isPremature && correctedAgeWeeks ? `🏥 Corrected Age (Born at ${gestationalWeeks}wks): ${correctedAgeWeeks.correctedMonths} Months (${correctedAgeWeeks.correctedWeeks} Weeks)` : ''}
📍 Calculated via agecalculatorupsc.com/baby-age-calculator`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3.5 sm:space-y-5">
      {/* Input Card */}
      <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-xs transition-colors">
        {/* Card Header Title */}
        <div className="border-b border-[var(--hairline)] pb-3 sm:pb-3.5 mb-3.5 sm:mb-4 text-center">
          <h1 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-[var(--ink-primary)]">
            {title || "Baby Age Calculator"}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--ink-body)] mt-1 max-w-xl mx-auto leading-relaxed">
            {subtitle || "Calculate exact baby age in weeks, months & days with gestational corrected age for premature births."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 md:gap-5">
          {/* DOB & Time */}
          <div className="space-y-1.5 sm:space-y-2">
            <DateInputField
              label="Baby's Date of Birth"
              value={dob}
              max={formatDateForInput(today)}
              onChange={(val) => {
                const maxStr = formatDateForInput(today);
                const clamped = val > maxStr ? maxStr : val;
                setDob(clamped);
              }}
            />
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-xs font-mono font-semibold text-[var(--ink-mute)]">Birth Time:</span>
              <input
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="h-8.5 sm:h-9 px-2.5 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg text-xs font-mono font-bold text-[var(--ink-primary)] focus:outline-none focus:ring-2 focus:ring-[#0070f3]/40"
              />
            </div>
          </div>

          {/* Premature Birth Adjustment Toggle */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-primary)]">
              Premature Birth Adjustment (Optional)
            </label>
            <div className="flex flex-wrap items-center gap-2 min-h-[38px] sm:min-h-[44px]">
              <button
                type="button"
                onClick={() => setIsPremature(!isPremature)}
                className={`h-9 sm:h-10 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer select-none flex items-center justify-center gap-1.5 shadow-2xs ${
                  isPremature
                    ? 'bg-[var(--ink-primary)] text-[var(--canvas-card)] border-[var(--ink-primary)] shadow-sm'
                    : 'bg-[var(--canvas-inset)] text-[var(--ink-body)] border-[var(--hairline)] hover:border-[var(--ink-primary)] hover:bg-[var(--canvas-card)]'
                }`}
              >
                {isPremature ? 'Premature Adjusted ✓' : '+ Add Gestational Weeks'}
              </button>

              {isPremature && (
                <div className="flex items-center gap-2 animate-fade-in-down">
                  <select
                    value={gestationalWeeks}
                    onChange={(e) => setGestationalWeeks(Number(e.target.value))}
                    className="h-9 sm:h-10 px-2.5 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg text-xs font-mono font-bold text-[var(--ink-primary)] cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0070f3]/40"
                  >
                    {Array.from({ length: 16 }, (_, i) => 24 + i).map((w) => (
                      <option key={w} value={w}>Born at {w} Weeks</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Results Display */}
      {ageData ? (
        <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-5.5 shadow-xs relative transition-colors animate-fade-in-down space-y-3.5 sm:space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-[var(--hairline)]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0070f3]" />
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-[var(--ink-mute)]">
                Exact Age Breakdown
              </span>
            </div>

            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-semibold text-[var(--ink-primary)] bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-md sm:rounded-lg hover:border-[var(--ink-primary)] hover:bg-[var(--canvas-card)] transition-all cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#0070f3]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>
          </div>

          {/* Primary Milestone Display (Weeks & Months) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
            <div className="bg-[var(--canvas-inset)] p-2.5 sm:p-3.5 md:p-4 rounded-lg sm:rounded-xl border border-[var(--hairline)] min-w-0 shadow-2xs">
              <span className="block text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-extrabold text-[var(--ink-primary)] font-mono-num tracking-tight truncate">
                {ageData.months}
              </span>
              <span className="text-[10px] sm:text-xs uppercase font-mono font-bold text-[var(--ink-mute)] block mt-0.5 sm:mt-1">
                Months ({ageData.days}d)
              </span>
            </div>

            <div className="bg-[var(--canvas-inset)] p-2.5 sm:p-3.5 md:p-4 rounded-lg sm:rounded-xl border border-[var(--hairline)] min-w-0 shadow-2xs">
              <span className="block text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-extrabold text-[#0070f3] dark:text-[#38bdf8] font-mono-num tracking-tight truncate">
                {ageData.totalWeeks}
              </span>
              <span className="text-[10px] sm:text-xs uppercase font-mono font-bold text-[var(--ink-mute)] block mt-0.5 sm:mt-1">
                Total Weeks
              </span>
            </div>

            <div className="bg-[var(--canvas-inset)] p-2.5 sm:p-3.5 md:p-4 rounded-lg sm:rounded-xl border border-[var(--hairline)] min-w-0 shadow-2xs">
              <span className="block text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-extrabold text-[var(--ink-primary)] font-mono-num tracking-tight truncate">
                {ageData.totalDays.toLocaleString()}
              </span>
              <span className="text-[10px] sm:text-xs uppercase font-mono font-bold text-[var(--ink-mute)] block mt-0.5 sm:mt-1">
                Total Days
              </span>
            </div>
          </div>

          {/* Corrected Age Box (If Premature) */}
          {isPremature && correctedAgeWeeks && (
            <div className="p-3 sm:p-4 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-lg sm:rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs animate-fade-in-down shadow-2xs">
              <div>
                <span className="font-bold text-[var(--ink-primary)] text-xs sm:text-sm">Pediatric Corrected Age (Born at {gestationalWeeks} Weeks):</span>
                <p className="text-[11px] text-[var(--ink-mute)] mt-0.5">Adjusts for {correctedAgeWeeks.prematureWeeks} weeks early arrival for milestone evaluation.</p>
              </div>
              <div className="font-mono text-xs sm:text-sm font-bold text-[#0070f3] dark:text-[#38bdf8] bg-[var(--canvas-card)] px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg border border-[var(--hairline)] shrink-0 self-start sm:self-auto shadow-xs">
                {correctedAgeWeeks.correctedMonths} Months ({correctedAgeWeeks.correctedWeeks} Wks)
              </div>
            </div>
          )}

          {/* Breakdown Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 pt-2.5 border-t border-[var(--hairline)] text-xs">
            <div className="p-2 sm:p-2.5 md:p-3 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)] shadow-2xs">
              <span className="block text-[10px] text-[var(--ink-mute)] font-mono uppercase font-semibold">Years Old</span>
              <span className="text-xs sm:text-sm md:text-base font-bold text-[var(--ink-primary)] font-mono-num block mt-0.5">{ageData.years} Years</span>
            </div>

            <div className="p-2 sm:p-2.5 md:p-3 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)] shadow-2xs">
              <span className="block text-[10px] text-[var(--ink-mute)] font-mono uppercase font-semibold">Total Hours</span>
              <span className="text-xs sm:text-sm md:text-base font-bold text-[var(--ink-primary)] font-mono-num block mt-0.5">{ageData.totalHours.toLocaleString()}</span>
            </div>

            <div className="p-2 sm:p-2.5 md:p-3 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)] shadow-2xs">
              <span className="block text-[10px] text-[var(--ink-mute)] font-mono uppercase font-semibold">Next Birthday</span>
              <span className="text-xs sm:text-sm md:text-base font-bold text-[#0070f3] dark:text-[#38bdf8] font-mono-num block mt-0.5">{ageData.nextBirthdayDays} Days</span>
            </div>

            <div className="p-2 sm:p-2.5 md:p-3 bg-[var(--canvas-card)] border border-[#0070f3]/40 dark:border-[#38bdf8]/40 rounded-lg flex items-center justify-between shadow-2xs">
              <div>
                <span className="block text-[10px] text-[var(--ink-mute)] font-mono uppercase font-semibold">Stage</span>
                <span className="text-xs font-bold text-[var(--ink-primary)] block mt-0.5">Pediatric Growth</span>
              </div>
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#f5a623]" />
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 sm:p-6 md:p-7 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl sm:rounded-2xl text-center space-y-1.5 shadow-xs">
          <Baby className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-[#0070f3]" />
          <h3 className="text-sm sm:text-base font-bold text-[var(--ink-primary)]">Ready for Baby Age Calculation</h3>
          <p className="text-xs text-[var(--ink-mute)] max-w-md mx-auto leading-relaxed">
            Enter your baby's Date of Birth in the box above to compute exact age in weeks, months, and developmental milestones.
          </p>
        </div>
      )}
    </div>
  );
};
