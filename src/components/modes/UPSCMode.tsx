import React, { useState, useEffect, useMemo } from 'react';
import type { Category, RelaxationOptions } from '../../lib/types';
import { calculateUPSCEligibility } from '../../lib/upsc-calculator';
import { formatDateForInput, calculateDateDifference } from '../../lib/date-utils';
import { DateInputField } from '../DateInputField';
import { CheckCircle2, XCircle, AlertCircle, Copy, Check, Clock, Shield, Award, Hourglass } from 'lucide-react';

interface UPSCModeProps {
  initialDob?: string;
  dob?: string;
  onDobChange?: (val: string) => void;
}

export const UPSCMode: React.FC<UPSCModeProps> = ({ 
  initialDob = '', 
  dob: controlledDob,
  onDobChange 
}) => {
  const [dob, setDob] = useState<string>(controlledDob !== undefined ? controlledDob : initialDob);
  const [showTime, setShowTime] = useState<boolean>(false);
  const [birthTime, setBirthTime] = useState<string>('12:00');
  const [category, setCategory] = useState<Category>('GEN');
  const [targetYear, setTargetYear] = useState<number>(2026);
  const [showRelaxations, setShowRelaxations] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (controlledDob !== undefined) {
      setDob(controlledDob);
    } else if (initialDob !== undefined) {
      setDob(initialDob);
    }
  }, [controlledDob, initialDob]);

  const handleDobInputChange = (val: string) => {
    const maxStr = formatDateForInput(new Date());
    const clamped = val && val > maxStr ? maxStr : val;
    setDob(clamped);
    if (onDobChange) {
      onDobChange(clamped);
    }
  };

  const [relaxations, setRelaxations] = useState<RelaxationOptions>({
    pwbd: false,
    exServicemen: false,
    defenceOps: false,
    jkDomicile: false,
  });

  const parsedDob = useMemo(() => {
    if (!dob) return null;
    const [y, m, d] = dob.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [dob]);

  const result = useMemo(() => {
    if (!parsedDob) return null;
    return calculateUPSCEligibility(parsedDob, targetYear, category, relaxations);
  }, [parsedDob, targetYear, category, relaxations]);

  // Underage time remaining countdown calculations
  const underageDetails = useMemo(() => {
    if (!result || result.status !== 'underage' || !parsedDob) return null;

    const turning21 = new Date(parsedDob);
    turning21.setFullYear(turning21.getFullYear() + 21);

    const today = new Date();
    const diff = calculateDateDifference(today, turning21);

    // Calculate first UPSC CSE exam year candidate is eligible for (>= 21 on 1st Aug)
    let firstYear = parsedDob.getFullYear() + 21;
    const cutoffFirstYear = new Date(firstYear, 7, 1);
    if (parsedDob > new Date(firstYear - 21, 7, 1)) {
      firstYear += 1;
    }

    return {
      turning21Date: turning21,
      timeRemaining: diff,
      firstEligibleYear: firstYear,
    };
  }, [parsedDob, result]);

  const toggleRelaxation = (key: keyof RelaxationOptions) => {
    setRelaxations((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopySummary = () => {
    if (!result) return;
    const text = `🎯 UPSC CSE ${targetYear} Eligibility Summary
📅 Date of Birth: ${dob}
🏷️ Category: ${category}
⭐ Status: ${result.status.toUpperCase()}
⏳ Age on 1st Aug ${targetYear}: ${result.ageOnCutoff.years} yrs, ${result.ageOnCutoff.months} mos, ${result.ageOnCutoff.days} days
🔢 Attempts Left: ${result.attemptsRemaining} / ${result.attemptsAllowed}
📍 Calculated via allagecalculators.com`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories: Category[] = ['GEN', 'EWS', 'OBC', 'SC', 'ST'];
  const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Input Card */}
      <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xs transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-start">
          {/* DOB Input */}
          <div className="md:col-span-1">
            <DateInputField
              label="Date of Birth"
              value={dob}
              max={formatDateForInput(new Date())}
              onChange={(val) => handleDobInputChange(val)}
            />
          </div>

          {/* Category Selector */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--ink-primary)]">
              Category <span className="text-[#ee0000]">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`h-10 sm:h-12 px-3 sm:px-4 text-xs sm:text-sm font-mono font-bold rounded-lg sm:rounded-xl border transition-all cursor-pointer select-none shadow-2xs flex items-center justify-center ${
                    category === cat
                      ? 'bg-[var(--ink-primary)] text-[var(--canvas-card)] border-[var(--ink-primary)] shadow-sm scale-[1.02]'
                      : 'bg-[var(--canvas-inset)] text-[var(--ink-body)] border-[var(--hairline)] hover:border-[var(--ink-primary)] hover:bg-[var(--canvas-card)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Target Exam Year Select */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--ink-primary)]">
              Target Exam Year <span className="text-[#ee0000]">*</span>
            </label>
            <select
              value={targetYear}
              onChange={(e) => setTargetYear(Number(e.target.value))}
              className="w-full h-10 sm:h-12 px-3 sm:px-4 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg sm:rounded-xl text-xs sm:text-sm font-mono font-bold text-[var(--ink-primary)] focus:outline-none focus:ring-2 focus:ring-[#0070f3]/40 focus:border-[#0070f3] shadow-2xs transition-all cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  UPSC CSE {y} (1st Aug {y})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Special Category Age Relaxations Toggle */}
        <div className="pt-2.5 sm:pt-3 border-t border-[var(--hairline)] mt-4 sm:mt-5">
          <button
            type="button"
            onClick={() => setShowRelaxations(!showRelaxations)}
            className="text-xs sm:text-sm text-[#0070f3] dark:text-[#38bdf8] hover:underline flex items-center gap-1.5 font-semibold cursor-pointer select-none py-1"
          >
            {showRelaxations ? '– Hide Special Category Relaxations' : '+ Add Special Category Relaxations (PwBD / Ex-Servicemen / Defence)'}
          </button>

          {showRelaxations && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-2.5 sm:pt-3 animate-fade-in-down">
              <label className="flex items-center gap-2 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-[var(--hairline)] bg-[var(--canvas-inset)] text-xs sm:text-sm font-medium text-[var(--ink-primary)] cursor-pointer hover:border-[var(--ink-primary)] transition shadow-2xs">
                <input
                  type="checkbox"
                  checked={relaxations.pwbd}
                  onChange={() => toggleRelaxation('pwbd')}
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded text-[#0070f3]"
                />
                <span>PwBD (+10 Yrs)</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-[var(--hairline)] bg-[var(--canvas-inset)] text-xs sm:text-sm font-medium text-[var(--ink-primary)] cursor-pointer hover:border-[var(--ink-primary)] transition shadow-2xs">
                <input
                  type="checkbox"
                  checked={relaxations.exServicemen}
                  onChange={() => toggleRelaxation('exServicemen')}
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded text-[#0070f3]"
                />
                <span>Ex-Servicemen (+5 Yrs)</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-[var(--hairline)] bg-[var(--canvas-inset)] text-xs sm:text-sm font-medium text-[var(--ink-primary)] cursor-pointer hover:border-[var(--ink-primary)] transition shadow-2xs">
                <input
                  type="checkbox"
                  checked={relaxations.defenceOps}
                  onChange={() => toggleRelaxation('defenceOps')}
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded text-[#0070f3]"
                />
                <span>Defence (+3 Yrs)</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-[var(--hairline)] bg-[var(--canvas-inset)] text-xs sm:text-sm font-medium text-[var(--ink-primary)] cursor-pointer hover:border-[var(--ink-primary)] transition shadow-2xs">
                <input
                  type="checkbox"
                  checked={relaxations.jkDomicile}
                  onChange={() => toggleRelaxation('jkDomicile')}
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded text-[#0070f3]"
                />
                <span>J&K (+5 Yrs)</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Main Results Card */}
      {result ? (
        <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xs relative transition-colors animate-fade-in-down space-y-4 sm:space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 sm:pb-4 border-b border-[var(--hairline)]">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#0070f3]" />
              <span className="text-xs sm:text-sm uppercase font-mono tracking-wider font-bold text-[var(--ink-mute)]">
                UPSC CSE {targetYear} Verdict
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

          {/* Verdict Status Banner */}
          <div>
            {result.status === 'eligible' && (
              <div className="p-3.5 sm:p-5 bg-emerald-500/10 border border-emerald-500/30 dark:bg-emerald-500/15 dark:border-emerald-500/40 rounded-xl sm:rounded-2xl flex items-start sm:items-center gap-3 sm:gap-3.5 text-emerald-600 dark:text-emerald-400 shadow-2xs">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <div className="text-sm sm:text-base md:text-lg font-bold">ELIGIBLE for UPSC CSE {targetYear}</div>
                  <div className="text-xs sm:text-sm text-[var(--ink-body)] mt-0.5 leading-relaxed">
                    Age on 1st August {targetYear} is within the {result.maxAgeAllowed} year limit for {category}.
                  </div>
                </div>
              </div>
            )}

            {result.status === 'underage' && (
              <div className="p-3.5 sm:p-5 bg-amber-500/10 border border-amber-500/30 dark:bg-amber-500/15 dark:border-amber-500/40 rounded-xl sm:rounded-2xl flex items-start sm:items-center gap-3 sm:gap-3.5 text-amber-600 dark:text-amber-400 shadow-2xs">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <div className="text-sm sm:text-base md:text-lg font-bold">UNDERAGE for UPSC CSE {targetYear}</div>
                  <div className="text-xs sm:text-sm text-[var(--ink-body)] mt-0.5 leading-relaxed">
                    {underageDetails ? `First eligible exam: UPSC CSE ${underageDetails.firstEligibleYear}. Must be 21+ on 1st August.` : `Must be at least 21 years old on 1st August ${targetYear}.`}
                  </div>
                </div>
              </div>
            )}

            {result.status === 'overage' && (
              <div className="p-3.5 sm:p-5 bg-rose-500/10 border border-rose-500/30 dark:bg-rose-500/15 dark:border-rose-500/40 rounded-xl sm:rounded-2xl flex items-start sm:items-center gap-3 sm:gap-3.5 text-rose-600 dark:text-rose-400 shadow-2xs">
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <div className="text-sm sm:text-base md:text-lg font-bold">OVERAGE for UPSC CSE {targetYear}</div>
                  <div className="text-xs sm:text-sm text-[var(--ink-body)] mt-0.5 leading-relaxed">
                    Exceeds maximum age limit of {result.maxAgeAllowed} years for {category} as of 1st August {targetYear}.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5 md:gap-4">
            <div className="bg-[var(--canvas-inset)] p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border border-[var(--hairline)] min-w-0 shadow-2xs">
              <span className="block text-[10px] sm:text-xs uppercase font-mono font-semibold text-[var(--ink-mute)] truncate">Age on 1st Aug {targetYear}</span>
              <span className="text-base sm:text-xl md:text-2xl font-bold text-[var(--ink-primary)] font-mono-num block mt-0.5 sm:mt-1 truncate">
                {result.ageOnCutoff.years}y {result.ageOnCutoff.months}m {result.ageOnCutoff.days}d
              </span>
            </div>

            <div className="bg-[var(--canvas-inset)] p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border border-[var(--hairline)] min-w-0 shadow-2xs">
              <span className="block text-[10px] sm:text-xs uppercase font-mono font-semibold text-[var(--ink-mute)] truncate">Attempts Allowed ({category})</span>
              <span className="text-base sm:text-xl md:text-2xl font-bold text-[var(--ink-primary)] font-mono-num block mt-0.5 sm:mt-1 truncate">
                {result.attemptsAllowed === 99 ? 'Unlimited' : `${result.attemptsAllowed}`}
              </span>
            </div>

            <div className="bg-[var(--canvas-inset)] p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border border-[var(--hairline)] min-w-0 shadow-2xs">
              <span className="block text-[10px] sm:text-xs uppercase font-mono font-semibold text-[var(--ink-mute)] truncate">Max Age Cap ({category})</span>
              <span className="text-base sm:text-xl md:text-2xl font-bold text-[var(--ink-primary)] font-mono-num block mt-0.5 sm:mt-1 truncate">
                {result.maxAgeAllowed} Years
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 sm:p-10 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-2xl sm:rounded-3xl text-center space-y-2 shadow-sm">
          <Shield className="w-8 h-8 mx-auto text-[#0070f3]" />
          <h3 className="text-base sm:text-lg font-bold text-[var(--ink-primary)]">Ready for Eligibility Verdict</h3>
          <p className="text-xs sm:text-sm text-[var(--ink-mute)] max-w-md mx-auto leading-relaxed">
            Enter your Date of Birth in the box above to calculate official Rule 6 eligibility and remaining attempts.
          </p>
        </div>
      )}
    </div>
  );
};
