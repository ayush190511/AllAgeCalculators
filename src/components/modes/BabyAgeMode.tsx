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
    <div className="space-y-4 sm:space-y-5">
      {/* Input Card */}
      <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl p-4 sm:p-5 md:p-6 shadow-xs transition-colors">
        <div className="flex items-center justify-between pb-3.5 border-b border-[var(--hairline)]">
          <div className="flex items-center gap-2">
            <span className="text-lg">👶</span>
            <h2 className="text-sm sm:text-base font-semibold tracking-tight text-[var(--ink-primary)]">
              Baby & Child Age Calculator
            </h2>
          </div>
          <span className="text-[11px] sm:text-xs font-mono px-2.5 py-1 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-md text-[var(--ink-body)]">
            Pediatric Standard
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-4">
          {/* DOB & Time */}
          <div className="space-y-2.5">
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
              <span className="text-xs font-mono text-[var(--ink-mute)]">Birth Time:</span>
              <input
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="h-8 px-2.5 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg text-xs font-mono text-[var(--ink-primary)]"
              />
            </div>
          </div>

          {/* Premature Birth Adjustment Toggle */}
          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wider text-[var(--ink-body)]">
              Premature Birth Adjustment (Optional)
            </label>
            <div className="flex flex-wrap items-center gap-2.5 min-h-[40px]">
              <button
                type="button"
                onClick={() => setIsPremature(!isPremature)}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition cursor-pointer select-none ${
                  isPremature
                    ? 'bg-[var(--ink-primary)] text-[var(--canvas-card)] border-[var(--ink-primary)]'
                    : 'bg-[var(--canvas-inset)] text-[var(--ink-body)] border-[var(--hairline)] hover:border-[var(--ink-primary)]'
                }`}
              >
                {isPremature ? 'Premature Adjusted ✓' : '+ Add Gestational Weeks'}
              </button>

              {isPremature && (
                <div className="flex items-center gap-2 animate-fade-in-down">
                  <select
                    value={gestationalWeeks}
                    onChange={(e) => setGestationalWeeks(Number(e.target.value))}
                    className="h-8 px-2.5 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg text-xs font-mono text-[var(--ink-primary)] cursor-pointer"
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
        <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl p-4 sm:p-5 md:p-6 shadow-xs relative transition-colors animate-fade-in-down">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-[var(--hairline)]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0070f3]" />
              <span className="text-xs uppercase font-mono tracking-wider text-[var(--ink-mute)]">Exact Age Breakdown</span>
            </div>

            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--ink-primary)] bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-lg hover:border-[var(--ink-primary)] transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#0070f3]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>
          </div>

          {/* Primary Milestone Display (Weeks & Months) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3.5 my-3 text-center">
            <div className="bg-[var(--canvas-inset)] p-2.5 sm:p-3.5 rounded-xl border border-[var(--hairline)] min-w-0">
              <span className="block text-xl sm:text-2xl md:text-3xl font-extrabold text-[var(--ink-primary)] font-mono-num truncate">
                {ageData.months}
              </span>
              <span className="text-[11px] uppercase font-mono text-[var(--ink-mute)] block mt-0.5">Months ({ageData.days}d)</span>
            </div>

            <div className="bg-[var(--canvas-inset)] p-2.5 sm:p-3.5 rounded-xl border border-[var(--hairline)] min-w-0">
              <span className="block text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0070f3] font-mono-num truncate">
                {ageData.totalWeeks}
              </span>
              <span className="text-[11px] uppercase font-mono text-[var(--ink-mute)] block mt-0.5">Total Weeks</span>
            </div>

            <div className="bg-[var(--canvas-inset)] p-2.5 sm:p-3.5 rounded-xl border border-[var(--hairline)] min-w-0">
              <span className="block text-xl sm:text-2xl md:text-3xl font-extrabold text-[var(--ink-primary)] font-mono-num truncate">
                {ageData.totalDays.toLocaleString()}
              </span>
              <span className="text-[11px] uppercase font-mono text-[var(--ink-mute)] block mt-0.5">Total Days</span>
            </div>
          </div>

          {/* Corrected Age Box (If Premature) */}
          {isPremature && correctedAgeWeeks && (
            <div className="my-3 p-3 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs animate-fade-in-down">
              <div>
                <span className="font-semibold text-[var(--ink-primary)]">Pediatric Corrected Age (Born at {gestationalWeeks} Weeks):</span>
                <p className="text-[11px] text-[var(--ink-mute)]">Adjusts for {correctedAgeWeeks.prematureWeeks} weeks early arrival for milestone evaluation.</p>
              </div>
              <div className="font-mono text-xs font-bold text-[#0070f3] bg-[var(--canvas-card)] px-3 py-1.5 rounded border border-[var(--hairline)] shrink-0 self-start sm:self-auto">
                {correctedAgeWeeks.correctedMonths} Months ({correctedAgeWeeks.correctedWeeks} Wks)
              </div>
            </div>
          )}

          {/* Breakdown Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-3 border-t border-[var(--hairline)] text-xs">
            <div className="p-2.5 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)]">
              <span className="block text-[10px] text-[var(--ink-mute)] font-mono uppercase">Years Old</span>
              <span className="text-sm sm:text-base font-bold text-[var(--ink-primary)] font-mono-num block mt-0.5">{ageData.years} Years</span>
            </div>

            <div className="p-2.5 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)]">
              <span className="block text-[10px] text-[var(--ink-mute)] font-mono uppercase">Total Hours</span>
              <span className="text-sm sm:text-base font-bold text-[var(--ink-primary)] font-mono-num block mt-0.5">{ageData.totalHours.toLocaleString()}</span>
            </div>

            <div className="p-2.5 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)]">
              <span className="block text-[10px] text-[var(--ink-mute)] font-mono uppercase">Next Birthday</span>
              <span className="text-sm sm:text-base font-bold text-[#0070f3] font-mono-num block mt-0.5">{ageData.nextBirthdayDays} Days</span>
            </div>

            <div className="p-2.5 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg flex items-center justify-between">
              <div>
                <span className="block text-[10px] text-[var(--ink-mute)] font-mono uppercase">Stage</span>
                <span className="text-xs font-bold text-[var(--ink-primary)]">Pediatric Growth</span>
              </div>
              <Sparkles className="w-4 h-4 text-[#f5a623]" />
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl text-center space-y-1.5">
          <Baby className="w-6 h-6 mx-auto text-[#0070f3]" />
          <h3 className="text-sm font-semibold text-[var(--ink-primary)]">Ready for Baby Age Calculation</h3>
          <p className="text-xs text-[var(--ink-mute)] max-w-sm mx-auto">
            Enter your baby's Date of Birth in the box above to compute exact age in weeks, months, and developmental milestones.
          </p>
        </div>
      )}
    </div>
  );
};
