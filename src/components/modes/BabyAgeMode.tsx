import React, { useState, useMemo } from 'react';
import { calculateAgeBreakdown, calculateDateDifference, formatDateForInput } from '../../lib/date-utils';
import { Baby, Calendar, Sparkles, Copy, Check, Clock } from 'lucide-react';

export const BabyAgeMode: React.FC = () => {
  const [dob, setDob] = useState<string>('2024-11-20');
  const [timeStr, setTimeStr] = useState<string>('07:15');
  const [isPremature, setIsPremature] = useState<boolean>(false);
  const [gestationalWeeks, setGestationalWeeks] = useState<number>(34); // Born at 34 weeks (3 weeks premature)
  const [copied, setCopied] = useState<boolean>(false);

  const today = useMemo(() => new Date(), []);

  const parsedDob = useMemo(() => {
    if (!dob) return new Date(2024, 10, 20);
    const [y, m, d] = dob.split('-').map(Number);
    const [h, min] = timeStr.split(':').map(Number);
    return new Date(y, m - 1, d, h || 0, min || 0);
  }, [dob, timeStr]);

  const ageData = useMemo(() => {
    return calculateAgeBreakdown(parsedDob, today);
  }, [parsedDob, today]);

  // Gestational Corrected Age (Subtract weeks premature from actual age)
  const correctedAgeWeeks = useMemo(() => {
    if (!isPremature) return null;
    const prematureWeeks = Math.max(0, 40 - gestationalWeeks);
    const actualWeeks = ageData.totalWeeks;
    const correctedWeeks = Math.max(0, actualWeeks - prematureWeeks);
    const correctedMonths = Math.floor(correctedWeeks / 4.345);
    return { prematureWeeks, correctedWeeks, correctedMonths };
  }, [isPremature, gestationalWeeks, ageData.totalWeeks]);

  const handleCopySummary = () => {
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
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Input Card */}
      <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl p-6 sm:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors">
        <div className="flex items-center justify-between pb-5 border-b border-[var(--hairline)]">
          <div className="flex items-center gap-2">
            <span className="text-xl">👶</span>
            <h2 className="text-lg font-semibold tracking-tight text-[var(--ink-primary)]">
              Baby & Child Age Calculator (Weeks & Months Precision)
            </h2>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-md text-[var(--ink-body)]">
            Pediatric Standard
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {/* DOB & Time */}
          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wider text-[var(--ink-body)]">
              Baby's Date & Time of Birth <span className="text-[#ee0000]">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dob}
                max={formatDateForInput(today)}
                onChange={(e) => {
                  const maxStr = formatDateForInput(today);
                  const val = e.target.value > maxStr ? maxStr : e.target.value;
                  setDob(val);
                }}
                className="w-full h-11 px-3.5 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg text-sm text-[var(--ink-primary)] font-mono-num focus:outline-none focus:ring-2 focus:ring-[var(--ink-primary)] transition"
              />
              <input
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="h-11 px-3 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg text-sm font-mono text-[var(--ink-primary)]"
              />
            </div>
          </div>

          {/* Premature Birth Adjustment Toggle */}
          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wider text-[var(--ink-body)]">
              Premature Birth Adjustment (Optional)
            </label>
            <div className="flex items-center gap-3 h-11">
              <button
                type="button"
                onClick={() => setIsPremature(!isPremature)}
                className={`px-4 py-2 text-xs font-medium rounded-lg border transition ${
                  isPremature
                    ? 'bg-[var(--ink-primary)] text-[var(--canvas-card)] border-[var(--ink-primary)]'
                    : 'bg-[var(--canvas-card)] text-[var(--ink-body)] border-[var(--hairline)] hover:border-[var(--ink-primary)]'
                }`}
              >
                {isPremature ? 'Premature Adjusted ✓' : '+ Add Gestational Weeks'}
              </button>

              {isPremature && (
                <div className="flex items-center gap-2 animate-fade-in-down">
                  <select
                    value={gestationalWeeks}
                    onChange={(e) => setGestationalWeeks(Number(e.target.value))}
                    className="h-10 px-2 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg text-xs font-mono text-[var(--ink-primary)]"
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
      <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl p-4 sm:p-6 md:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[var(--hairline)]">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#0070f3]" />
            <span className="text-xs uppercase font-mono tracking-wider text-[var(--ink-mute)]">Exact Age Breakdown</span>
          </div>

          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--ink-primary)] bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-lg hover:border-[var(--ink-primary)] transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#0070f3]" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Summary'}
          </button>
        </div>

        {/* Primary Milestone Display (Weeks & Months) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 my-6 text-center">
          <div className="bg-[var(--canvas-inset)] p-4 sm:p-5 rounded-xl border border-[var(--hairline)] min-w-0">
            <span className="block text-2xl sm:text-4xl font-extrabold text-[var(--ink-primary)] font-mono-num truncate">
              {ageData.months}
            </span>
            <span className="text-xs uppercase font-mono text-[var(--ink-mute)] block mt-0.5">Months ({ageData.days} Days)</span>
          </div>

          <div className="bg-[var(--canvas-inset)] p-4 sm:p-5 rounded-xl border border-[var(--hairline)] min-w-0">
            <span className="block text-2xl sm:text-4xl font-extrabold text-[#0070f3] font-mono-num truncate">
              {ageData.totalWeeks}
            </span>
            <span className="text-xs uppercase font-mono text-[var(--ink-mute)] block mt-0.5">Total Weeks</span>
          </div>

          <div className="bg-[var(--canvas-inset)] p-4 sm:p-5 rounded-xl border border-[var(--hairline)] min-w-0">
            <span className="block text-2xl sm:text-4xl font-extrabold text-[var(--ink-primary)] font-mono-num truncate">
              {ageData.totalDays.toLocaleString()}
            </span>
            <span className="text-xs uppercase font-mono text-[var(--ink-mute)] block mt-0.5">Total Days</span>
          </div>
        </div>

        {/* Corrected Age Box (If Premature) */}
        {isPremature && correctedAgeWeeks && (
          <div className="my-4 p-4 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fade-in-down">
            <div>
              <span className="font-semibold text-[var(--ink-primary)]">Pediatric Corrected Age (Born at {gestationalWeeks} Weeks):</span>
              <p className="text-[11px] text-[var(--ink-mute)]">Adjusts for {correctedAgeWeeks.prematureWeeks} weeks early arrival for milestone evaluation.</p>
            </div>
            <div className="font-mono text-sm font-bold text-[#0070f3] bg-[var(--canvas-card)] px-3 py-1.5 rounded border border-[var(--hairline)] shrink-0 self-start sm:self-auto">
              {correctedAgeWeeks.correctedMonths} Months ({correctedAgeWeeks.correctedWeeks} Wks)
            </div>
          </div>
        )}

        {/* Breakdown Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 pt-4 border-t border-[var(--hairline)] text-xs">
          <div className="p-3 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)]">
            <span className="block text-[var(--ink-mute)] font-mono uppercase">Years Old</span>
            <span className="text-base font-bold text-[var(--ink-primary)] font-mono-num">{ageData.years} Years</span>
          </div>

          <div className="p-3 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)]">
            <span className="block text-[var(--ink-mute)] font-mono uppercase">Total Hours Lived</span>
            <span className="text-base font-bold text-[var(--ink-primary)] font-mono-num">{ageData.totalHours.toLocaleString()}</span>
          </div>

          <div className="p-3 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)]">
            <span className="block text-[var(--ink-mute)] font-mono uppercase">Next Birthday</span>
            <span className="text-base font-bold text-[#0070f3] font-mono-num">{ageData.nextBirthdayDays} Days</span>
          </div>

          <div className="p-3 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg flex items-center justify-between">
            <div>
              <span className="block text-[11px] text-[var(--ink-mute)] font-mono uppercase">Target Entry</span>
              <span className="text-xs font-bold text-[var(--ink-primary)]">School Admission</span>
            </div>
            <Sparkles className="w-4 h-4 text-[#f5a623]" />
          </div>
        </div>
      </div>
    </div>
  );
};
