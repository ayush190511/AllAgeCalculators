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

  const [showRelaxations, setShowRelaxations] = useState<boolean>(false);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Input Card */}
      <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl p-4 sm:p-5 md:p-6 shadow-xs transition-colors">
        <div className="flex items-center justify-between pb-3.5 border-b border-[var(--hairline)]">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#0070f3]" />
            <h2 className="text-sm sm:text-base font-semibold tracking-tight text-[var(--ink-primary)]">
              UPSC CSE Age & Eligibility Engine
            </h2>
          </div>
          <span className="text-[11px] sm:text-xs font-mono px-2.5 py-1 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-md text-[var(--ink-body)]">
            Cutoff: 1st August {targetYear}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 pt-4 items-start">
          {/* DOB Input */}
          <div>
            <DateInputField
              label="Date of Birth"
              value={dob}
              max={formatDateForInput(new Date())}
              onChange={(val) => handleDobInputChange(val)}
            />
          </div>

          {/* Category Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wider text-[var(--ink-body)]">
              Category <span className="text-[#ee0000]">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg border transition cursor-pointer select-none ${
                    category === cat
                      ? 'bg-[var(--ink-primary)] text-[var(--canvas-card)] border-[var(--ink-primary)] shadow-sm'
                      : 'bg-[var(--canvas-inset)] text-[var(--ink-body)] border-[var(--hairline)] hover:border-[var(--ink-primary)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Target Exam Year Select */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wider text-[var(--ink-body)]">
              Target Exam Year <span className="text-[#ee0000]">*</span>
            </label>
            <select
              value={targetYear}
              onChange={(e) => setTargetYear(Number(e.target.value))}
              className="w-full h-10 px-3 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg text-xs sm:text-sm font-mono text-[var(--ink-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ink-primary)] transition cursor-pointer"
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
        <div className="pt-2.5 border-t border-[var(--hairline)] mt-3.5">
          <button
            type="button"
            onClick={() => setShowRelaxations(!showRelaxations)}
            className="text-xs text-[#0070f3] hover:underline flex items-center gap-1 font-medium cursor-pointer select-none"
          >
            {showRelaxations ? '– Hide Special Category Relaxations' : '+ Add Special Category Relaxations (PwBD / Ex-Servicemen / Defence)'}
          </button>

          {showRelaxations && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2.5 animate-fade-in-down">
              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-[var(--hairline)] bg-[var(--canvas-inset)] text-xs text-[var(--ink-primary)] cursor-pointer hover:border-[var(--ink-primary)] transition">
                <input
                  type="checkbox"
                  checked={relaxations.pwbd}
                  onChange={() => toggleRelaxation('pwbd')}
                  className="h-3.5 w-3.5 rounded text-[#0070f3]"
                />
                <span>PwBD (+10 Yrs)</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-[var(--hairline)] bg-[var(--canvas-inset)] text-xs text-[var(--ink-primary)] cursor-pointer hover:border-[var(--ink-primary)] transition">
                <input
                  type="checkbox"
                  checked={relaxations.exServicemen}
                  onChange={() => toggleRelaxation('exServicemen')}
                  className="h-3.5 w-3.5 rounded text-[#0070f3]"
                />
                <span>Ex-Servicemen (+5 Yrs)</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-[var(--hairline)] bg-[var(--canvas-inset)] text-xs text-[var(--ink-primary)] cursor-pointer hover:border-[var(--ink-primary)] transition">
                <input
                  type="checkbox"
                  checked={relaxations.defenceOps}
                  onChange={() => toggleRelaxation('defenceOps')}
                  className="h-3.5 w-3.5 rounded text-[#0070f3]"
                />
                <span>Defence Disabled (+3 Yrs)</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-[var(--hairline)] bg-[var(--canvas-inset)] text-xs text-[var(--ink-primary)] cursor-pointer hover:border-[var(--ink-primary)] transition">
                <input
                  type="checkbox"
                  checked={relaxations.jkDomicile}
                  onChange={() => toggleRelaxation('jkDomicile')}
                  className="h-3.5 w-3.5 rounded text-[#0070f3]"
                />
                <span>J&K (+5 Yrs)</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Main Results Card */}
      {result ? (
        <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl p-4 sm:p-5 md:p-6 shadow-xs relative transition-colors animate-fade-in-down">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-[var(--hairline)]">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#0070f3]" />
              <span className="text-xs uppercase font-mono tracking-wider text-[var(--ink-mute)]">UPSC CSE {targetYear} Verdict</span>
            </div>

            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--ink-primary)] bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-lg hover:border-[var(--ink-primary)] transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#0070f3]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>
          </div>

          {/* Verdict Status Banner */}
          <div className="my-4">
            {result.status === 'eligible' && (
              <div className="p-3 bg-[#0070f3]/10 border border-[#0070f3]/30 rounded-xl flex items-center gap-3 text-[#0070f3]">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <div>
                  <div className="text-sm sm:text-base font-bold">ELIGIBLE for UPSC CSE {targetYear}</div>
                  <div className="text-xs text-[var(--ink-body)]">
                    Age on 1st August {targetYear} is within the {result.maxAgeAllowed} year limit for {category}.
                  </div>
                </div>
              </div>
            )}

            {result.status === 'underage' && (
              <div className="p-3 bg-[#f5a623]/10 border border-[#f5a623]/30 rounded-xl flex items-center gap-3 text-[#f5a623]">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <div>
                  <div className="text-sm sm:text-base font-bold">UNDERAGE for UPSC CSE {targetYear}</div>
                  <div className="text-xs text-[var(--ink-body)]">
                    {underageDetails ? `First eligible exam: UPSC CSE ${underageDetails.firstEligibleYear}. Must be 21+ on 1st Aug.` : `Must be at least 21 years old on 1st August ${targetYear}.`}
                  </div>
                </div>
              </div>
            )}

            {result.status === 'overage' && (
              <div className="p-3 bg-[#ee0000]/10 border border-[#ee0000]/30 rounded-xl flex items-center gap-3 text-[#ee0000]">
                <XCircle className="w-5 h-5 shrink-0" />
                <div>
                  <div className="text-sm sm:text-base font-bold">OVERAGE for UPSC CSE {targetYear}</div>
                  <div className="text-xs text-[var(--ink-body)]">
                    Exceeds maximum age limit of {result.maxAgeAllowed} years for {category} as of 1st August {targetYear}.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 my-3 text-center">
            <div className="bg-[var(--canvas-inset)] p-2.5 sm:p-3 rounded-xl border border-[var(--hairline)] min-w-0">
              <span className="block text-[10px] uppercase font-mono text-[var(--ink-mute)] truncate">Age on 1st Aug {targetYear}</span>
              <span className="text-sm sm:text-base md:text-lg font-bold text-[var(--ink-primary)] font-mono-num block mt-0.5 truncate">
                {result.ageOnCutoff.years}y {result.ageOnCutoff.months}m {result.ageOnCutoff.days}d
              </span>
            </div>

            <div className="bg-[var(--canvas-inset)] p-2.5 sm:p-3 rounded-xl border border-[var(--hairline)] min-w-0">
              <span className="block text-[10px] uppercase font-mono text-[var(--ink-mute)] truncate">Attempts Allowed ({category})</span>
              <span className="text-sm sm:text-base md:text-lg font-bold text-[var(--ink-primary)] font-mono-num block mt-0.5 truncate">
                {result.attemptsAllowed === 99 ? 'Unlimited' : `${result.attemptsAllowed}`}
              </span>
            </div>

            <div className="bg-[var(--canvas-inset)] p-2.5 sm:p-3 rounded-xl border border-[var(--hairline)] min-w-0">
              <span className="block text-[10px] uppercase font-mono text-[var(--ink-mute)] truncate">Max Age Cap ({category})</span>
              <span className="text-sm sm:text-base md:text-lg font-bold text-[var(--ink-primary)] font-mono-num block mt-0.5 truncate">
                {result.maxAgeAllowed} Years
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl text-center space-y-1.5">
          <Shield className="w-6 h-6 mx-auto text-[#0070f3]" />
          <h3 className="text-sm font-semibold text-[var(--ink-primary)]">Ready for Eligibility Verdict</h3>
          <p className="text-xs text-[var(--ink-mute)] max-w-sm mx-auto">
            Enter your Date of Birth in the box above to calculate official Rule 6 eligibility and remaining attempts.
          </p>
        </div>
      )}
    </div>
  );
};
