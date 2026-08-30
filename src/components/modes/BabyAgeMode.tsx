import React, { useState, useMemo } from 'react';
import { calculateAgeBreakdown, calculateDateDifference, formatDateForInput } from '../../lib/date-utils';
import { DateInputField } from '../DateInputField';
import { Baby, Calendar, Sparkles, Copy, Check, Clock } from 'lucide-react';

export const BabyAgeMode: React.FC = () => {
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
    <div className="space-y-4 sm:space-y-6">
      {/* Input Card */}
      <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xs transition-colors">
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[var(--hairline)]">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="text-lg sm:text-xl">👶</span>
            <h2 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-[var(--ink-primary)]">
              Baby & Child Age Calculator
            </h2>
          </div>
          <span className="text-[11px] sm:text-xs font-mono px-2.5 py-1 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-md sm:rounded-lg text-[var(--ink-body)] font-medium">
            Pediatric Standard
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-7 pt-4 sm:pt-5">
          {/* DOB & Time */}
          <div className="space-y-2 sm:space-y-3">
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
            <div className="flex items-center gap-2.5 sm:gap-3 pt-0.5 sm:pt-1">
              <span className="text-xs sm:text-sm font-mono font-semibold text-[var(--ink-mute)]">Birth Time:</span>
              <input
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="h-9 sm:h-11 px-3 sm:px-3.5 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg sm:rounded-xl text-xs sm:text-sm font-mono font-bold text-[var(--ink-primary)] focus:outline-none focus:ring-2 focus:ring-[#0070f3]/40"
              />
            </div>
          </div>

          {/* Premature Birth Adjustment Toggle */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--ink-primary)]">
              Premature Birth Adjustment (Optional)
            </label>
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 min-h-[40px] sm:min-h-[48px]">
              <button
                type="button"
                onClick={() => setIsPremature(!isPremature)}
                className={`h-10 sm:h-12 px-3 sm:px-4 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl border transition-all cursor-pointer select-none flex items-center justify-center gap-1.5 sm:gap-2 shadow-2xs ${
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
                    className="h-10 sm:h-12 px-3 sm:px-4 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg sm:rounded-xl text-xs sm:text-sm font-mono font-bold text-[var(--ink-primary)] cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0070f3]/40"
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
        <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xs relative transition-colors animate-fade-in-down space-y-4 sm:space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 sm:pb-4 border-b border-[var(--hairline)]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#0070f3]" />
              <span className="text-xs sm:text-sm uppercase font-mono tracking-wider font-bold text-[var(--ink-mute)]">
                Exact Age Breakdown
              </span>
            </div>

            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-[var(--ink-primary)] bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-lg sm:rounded-xl hover:border-[var(--ink-primary)] hover:bg-[var(--canvas-card)] transition-all cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0070f3]" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>
          </div>

          {/* Primary Milestone Display (Weeks & Months) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3.5 md:gap-4 text-center">
            <div className="bg-[var(--canvas-inset)] p-3 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[var(--hairline)] min-w-0 shadow-2xs">
              <span className="block text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[var(--ink-primary)] font-mono-num tracking-tight truncate">
                {ageData.months}
              </span>
              <span className="text-[11px] sm:text-sm uppercase font-mono font-bold text-[var(--ink-mute)] block mt-0.5 sm:mt-2">
                Months ({ageData.days}d)
              </span>
            </div>

            <div className="bg-[var(--canvas-inset)] p-3 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[var(--hairline)] min-w-0 shadow-2xs">
              <span className="block text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#0070f3] dark:text-[#38bdf8] font-mono-num tracking-tight truncate">
                {ageData.totalWeeks}
              </span>
              <span className="text-[11px] sm:text-sm uppercase font-mono font-bold text-[var(--ink-mute)] block mt-0.5 sm:mt-2">
                Total Weeks
              </span>
            </div>

            <div className="bg-[var(--canvas-inset)] p-3 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[var(--hairline)] min-w-0 shadow-2xs">
              <span className="block text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[var(--ink-primary)] font-mono-num tracking-tight truncate">
                {ageData.totalDays.toLocaleString()}
              </span>
              <span className="text-[11px] sm:text-sm uppercase font-mono font-bold text-[var(--ink-mute)] block mt-0.5 sm:mt-2">
                Total Days
              </span>
            </div>
          </div>

          {/* Corrected Age Box (If Premature) */}
          {isPremature && correctedAgeWeeks && (
            <div className="p-3.5 sm:p-5 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-xl sm:rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 text-xs sm:text-sm animate-fade-in-down shadow-2xs">
              <div>
                <span className="font-bold text-[var(--ink-primary)] text-xs sm:text-base">Pediatric Corrected Age (Born at {gestationalWeeks} Weeks):</span>
                <p className="text-[11px] sm:text-xs text-[var(--ink-mute)] mt-0.5">Adjusts for {correctedAgeWeeks.prematureWeeks} weeks early arrival for milestone evaluation.</p>
              </div>
              <div className="font-mono text-xs sm:text-base font-bold text-[#0070f3] dark:text-[#38bdf8] bg-[var(--canvas-card)] px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl border border-[var(--hairline)] shrink-0 self-start sm:self-auto shadow-xs">
                {correctedAgeWeeks.correctedMonths} Months ({correctedAgeWeeks.correctedWeeks} Wks)
              </div>
            </div>
          )}

          {/* Breakdown Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 pt-3 border-t border-[var(--hairline)] text-xs sm:text-sm">
            <div className="p-2.5 sm:p-3.5 md:p-4 bg-[var(--canvas-inset)] rounded-lg sm:rounded-xl md:rounded-2xl border border-[var(--hairline)] shadow-2xs">
              <span className="block text-[10px] sm:text-xs text-[var(--ink-mute)] font-mono uppercase font-semibold">Years Old</span>
              <span className="text-sm sm:text-base font-bold text-[var(--ink-primary)] font-mono-num block mt-0.5 sm:mt-1">{ageData.years} Years</span>
            </div>

            <div className="p-2.5 sm:p-3.5 md:p-4 bg-[var(--canvas-inset)] rounded-lg sm:rounded-xl md:rounded-2xl border border-[var(--hairline)] shadow-2xs">
              <span className="block text-[10px] sm:text-xs text-[var(--ink-mute)] font-mono uppercase font-semibold">Total Hours</span>
              <span className="text-sm sm:text-base font-bold text-[var(--ink-primary)] font-mono-num block mt-0.5 sm:mt-1">{ageData.totalHours.toLocaleString()}</span>
            </div>

            <div className="p-2.5 sm:p-3.5 md:p-4 bg-[var(--canvas-inset)] rounded-lg sm:rounded-xl md:rounded-2xl border border-[var(--hairline)] shadow-2xs">
              <span className="block text-[10px] sm:text-xs text-[var(--ink-mute)] font-mono uppercase font-semibold">Next Birthday</span>
              <span className="text-sm sm:text-base font-bold text-[#0070f3] dark:text-[#38bdf8] font-mono-num block mt-0.5 sm:mt-1">{ageData.nextBirthdayDays} Days</span>
            </div>

            <div className="p-2.5 sm:p-3.5 md:p-4 bg-[var(--canvas-card)] border border-[#0070f3]/40 dark:border-[#38bdf8]/40 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-between shadow-2xs">
              <div>
                <span className="block text-[10px] sm:text-xs text-[var(--ink-mute)] font-mono uppercase font-semibold">Stage</span>
                <span className="text-xs sm:text-sm font-bold text-[var(--ink-primary)] block mt-0.5">Pediatric Growth</span>
              </div>
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#f5a623]" />
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 sm:p-8 md:p-10 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl sm:rounded-2xl md:rounded-3xl text-center space-y-1.5 sm:space-y-2 shadow-xs">
          <Baby className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-[#0070f3]" />
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-[var(--ink-primary)]">Ready for Baby Age Calculation</h3>
          <p className="text-xs sm:text-sm text-[var(--ink-mute)] max-w-md mx-auto leading-relaxed">
            Enter your baby's Date of Birth in the box above to compute exact age in weeks, months, and developmental milestones.
          </p>
        </div>
      )}
    </div>
  );
};
