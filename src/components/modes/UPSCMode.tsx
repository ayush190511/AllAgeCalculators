import React, { useState, useEffect, useMemo } from 'react';
import type { Category, RelaxationOptions } from '../../lib/types';
import { calculateUPSCEligibility } from '../../lib/upsc-calculator';
import { formatDateForInput, calculateDateDifference } from '../../lib/date-utils';
import { CheckCircle2, XCircle, AlertCircle, Copy, Check, Clock, Shield, Award, Hourglass } from 'lucide-react';

interface UPSCModeProps {
  initialDob?: string;
  onDobChange?: (val: string) => void;
}

export const UPSCMode: React.FC<UPSCModeProps> = ({ initialDob = '1998-05-15', onDobChange }) => {
  const [dob, setDob] = useState<string>(initialDob);
  const [showTime, setShowTime] = useState<boolean>(false);
  const [birthTime, setBirthTime] = useState<string>('12:00');
  const [category, setCategory] = useState<Category>('GEN');
  const [targetYear, setTargetYear] = useState<number>(2026);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (initialDob) {
      setDob(initialDob);
    }
  }, [initialDob]);

  const handleDobInputChange = (val: string) => {
    const maxStr = formatDateForInput(new Date());
    const clamped = val > maxStr ? maxStr : val;
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
    if (!dob) return new Date(1998, 4, 15);
    const [y, m, d] = dob.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [dob]);

  const result = useMemo(() => {
    return calculateUPSCEligibility(parsedDob, targetYear, category, relaxations);
  }, [parsedDob, targetYear, category, relaxations]);

  // Underage time remaining countdown calculations
  const underageDetails = useMemo(() => {
    if (result.status !== 'underage') return null;

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
  }, [parsedDob, result.status]);

  const toggleRelaxation = (key: keyof RelaxationOptions) => {
    setRelaxations((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopySummary = () => {
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
    <div className="space-y-8">
      {/* Hero Input Section */}
      <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl p-4 sm:p-6 md:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[var(--hairline)]">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#0070f3]" />
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-[var(--ink-primary)]">
              UPSC CSE Age & Eligibility Engine
            </h2>
          </div>
          <span className="self-start sm:self-auto text-[11px] sm:text-xs font-mono px-2.5 py-1 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-md text-[var(--ink-body)]">
            Cutoff: 1st August {targetYear}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 pt-6">
          {/* DOB Input */}
          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wider text-[var(--ink-body)]">
              Date of Birth <span className="text-[#ee0000]">*</span>
            </label>
            <input
              type="date"
              value={dob}
              max={formatDateForInput(new Date())}
              onChange={(e) => handleDobInputChange(e.target.value)}
              className="w-full h-11 px-3.5 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg text-sm text-[var(--ink-primary)] font-mono-num focus:outline-none focus:ring-2 focus:ring-[var(--ink-primary)] transition cursor-pointer"
            />
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowTime(!showTime)}
                className="text-xs text-[var(--ink-mute)] hover:text-[var(--ink-primary)] flex items-center gap-1 font-mono transition cursor-pointer"
              >
                <Clock className="w-3 h-3" />
                {showTime ? 'Hide birth time precision' : '+ Add birth time (optional precision)'}
              </button>
              {showTime && (
                <div className="mt-2 flex items-center gap-2 animate-fade-in-down">
                  <input
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className="h-9 px-3 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-md text-xs font-mono text-[var(--ink-primary)]"
                  />
                  <span className="text-[11px] text-[var(--ink-mute)]">Note: UPSC rules calculate at day level.</span>
                </div>
              )}
            </div>
          </div>

          {/* Category Pills */}
          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wider text-[var(--ink-body)]">
              Category <span className="text-[#ee0000]">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-2 text-xs font-mono font-medium rounded-lg border transition cursor-pointer ${
                    category === cat
                      ? 'bg-[var(--ink-primary)] text-[var(--canvas-card)] border-[var(--ink-primary)] shadow-sm'
                      : 'bg-[var(--canvas-card)] text-[var(--ink-body)] border-[var(--hairline)] hover:border-[var(--ink-primary)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Target Exam Year */}
          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wider text-[var(--ink-body)]">
              Target Exam Year <span className="text-[#ee0000]">*</span>
            </label>
            <select
              value={targetYear}
              onChange={(e) => setTargetYear(Number(e.target.value))}
              className="w-full h-11 px-3.5 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg text-sm font-mono text-[var(--ink-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ink-primary)] transition cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  UPSC CSE {y} (1st Aug {y})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Relaxation Checkboxes */}
        <div className="mt-6 pt-5 border-t border-[var(--hairline)] space-y-3">
          <label className="block text-xs font-medium uppercase tracking-wider text-[var(--ink-body)]">
            Special Category Age Relaxations (Optional)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            <label className="flex items-center gap-2.5 p-3 rounded-lg border border-[var(--hairline)] bg-[var(--canvas-inset)] text-xs text-[var(--ink-primary)] cursor-pointer hover:border-[var(--ink-primary)] transition">
              <input
                type="checkbox"
                checked={relaxations.pwbd}
                onChange={() => toggleRelaxation('pwbd')}
                className="h-4 w-4 rounded border-[var(--hairline)] text-[#0070f3] focus:ring-0"
              />
              <span>PwBD (+10 Yrs)</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-lg border border-[var(--hairline)] bg-[var(--canvas-inset)] text-xs text-[var(--ink-primary)] cursor-pointer hover:border-[var(--ink-primary)] transition">
              <input
                type="checkbox"
                checked={relaxations.exServicemen}
                onChange={() => toggleRelaxation('exServicemen')}
                className="h-4 w-4 rounded border-[var(--hairline)] text-[#0070f3] focus:ring-0"
              />
              <span>Ex-Servicemen (+5 Yrs)</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-lg border border-[var(--hairline)] bg-[var(--canvas-inset)] text-xs text-[var(--ink-primary)] cursor-pointer hover:border-[var(--ink-primary)] transition">
              <input
                type="checkbox"
                checked={relaxations.defenceOps}
                onChange={() => toggleRelaxation('defenceOps')}
                className="h-4 w-4 rounded border-[var(--hairline)] text-[#0070f3] focus:ring-0"
              />
              <span>Disabled Defence (+3 Yrs)</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-lg border border-[var(--hairline)] bg-[var(--canvas-inset)] text-xs text-[var(--ink-primary)] cursor-pointer hover:border-[var(--ink-primary)] transition">
              <input
                type="checkbox"
                checked={relaxations.jkDomicile}
                onChange={() => toggleRelaxation('jkDomicile')}
                className="h-4 w-4 rounded border-[var(--hairline)] text-[#0070f3] focus:ring-0"
              />
              <span>J&K Domicile (+5 Yrs)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Verdict Card */}
      <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl p-4 sm:p-6 md:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[var(--hairline)]">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#0070f3]" />
            <span className="text-xs uppercase font-mono tracking-wider text-[var(--ink-mute)]">UPSC CSE {targetYear} Verdict</span>
          </div>

          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--ink-primary)] bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-lg hover:border-[var(--ink-primary)] transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#0070f3]" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Summary'}
          </button>
        </div>

        {/* Verdict Badge & Underage Countdown */}
        <div className="my-6 space-y-4">
          {result.status === 'eligible' && (
            <div className="p-4 bg-[#0070f3]/10 border border-[#0070f3]/30 rounded-xl flex items-center gap-3 text-[#0070f3]">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <div>
                <div className="text-base font-bold">ELIGIBLE for UPSC CSE {targetYear}</div>
                <div className="text-xs text-[var(--ink-body)]">
                  Your age on 1st August {targetYear} is within the required {result.maxAgeAllowed} year limit for {category}.
                </div>
              </div>
            </div>
          )}

          {result.status === 'underage' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#f5a623]/10 border border-[#f5a623]/30 rounded-xl flex items-center gap-3 text-[#f5a623]">
                <AlertCircle className="w-6 h-6 shrink-0" />
                <div>
                  <div className="text-base font-bold">UNDERAGE for UPSC CSE {targetYear}</div>
                  <div className="text-xs text-[var(--ink-body)] mt-0.5">
                    Candidates must be at least 21 years old on 1st August {targetYear}.
                  </div>
                </div>
              </div>

              {/* Exact Underage Countdown Box */}
              {underageDetails && (
                <div className="p-4 sm:p-5 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-xl space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs font-mono">
                    <span className="text-[var(--ink-primary)] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Hourglass className="w-4 h-4 text-[#f5a623] shrink-0" /> Time Remaining Until 21st Birthday & UPSC Eligibility
                    </span>
                    <span className="text-[#0070f3] font-bold">
                      First Eligible Exam: UPSC CSE {underageDetails.firstEligibleYear}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 sm:gap-3 text-center">
                    <div className="p-2.5 sm:p-3 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg min-w-0">
                      <span className="block text-xl sm:text-3xl font-extrabold text-[var(--ink-primary)] font-mono-num truncate">
                        {underageDetails.timeRemaining.years}
                      </span>
                      <span className="text-[10px] sm:text-[11px] uppercase font-mono text-[var(--ink-mute)] block mt-0.5">Years Left</span>
                    </div>
                    <div className="p-2.5 sm:p-3 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg min-w-0">
                      <span className="block text-xl sm:text-3xl font-extrabold text-[var(--ink-primary)] font-mono-num truncate">
                        {underageDetails.timeRemaining.months}
                      </span>
                      <span className="text-[10px] sm:text-[11px] uppercase font-mono text-[var(--ink-mute)] block mt-0.5">Months Left</span>
                    </div>
                    <div className="p-2.5 sm:p-3 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg min-w-0">
                      <span className="block text-xl sm:text-3xl font-extrabold text-[var(--ink-primary)] font-mono-num truncate">
                        {underageDetails.timeRemaining.days}
                      </span>
                      <span className="text-[10px] sm:text-[11px] uppercase font-mono text-[var(--ink-mute)] block mt-0.5">Days Left</span>
                    </div>
                  </div>

                  <div className="text-xs text-[var(--ink-body)] flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-2 border-t border-[var(--hairline)]">
                    <span>21st Birthday: <strong className="font-mono text-[var(--ink-primary)]">{formatDateForInput(underageDetails.turning21Date)}</strong></span>
                    <span>Total Days Remaining: <strong className="font-mono text-[#0070f3]">{underageDetails.timeRemaining.totalDays.toLocaleString()} Days</strong></span>
                  </div>
                </div>
              )}
            </div>
          )}

          {result.status === 'overage' && (
            <div className="p-4 bg-[#ee0000]/10 border border-[#ee0000]/30 rounded-xl flex items-center gap-3 text-[#ee0000]">
              <XCircle className="w-6 h-6 shrink-0" />
              <div>
                <div className="text-base font-bold">OVERAGE for UPSC CSE {targetYear}</div>
                <div className="text-xs text-[var(--ink-body)]">
                  Exceeds the maximum age cap of {result.maxAgeAllowed} years for {category} as of 1st August {targetYear}.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Primary Age Stats Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 my-6">
          <div className="bg-[var(--canvas-inset)] p-4 sm:p-5 rounded-xl border border-[var(--hairline)]">
            <span className="block text-xs uppercase font-mono text-[var(--ink-mute)]">Age on 1st Aug {targetYear}</span>
            <span className="text-xl sm:text-3xl font-extrabold text-[var(--ink-primary)] font-mono-num block mt-1">
              {result.ageOnCutoff.years}y {result.ageOnCutoff.months}m {result.ageOnCutoff.days}d
            </span>
          </div>

          <div className="bg-[var(--canvas-inset)] p-4 sm:p-5 rounded-xl border border-[var(--hairline)]">
            <span className="block text-xs uppercase font-mono text-[var(--ink-mute)]">Attempts Allowed ({category})</span>
            <span className="text-xl sm:text-3xl font-extrabold text-[var(--ink-primary)] font-mono-num block mt-1">
              {result.attemptsAllowed === 99 ? 'Unlimited' : `${result.attemptsAllowed} Attempts`}
            </span>
          </div>

          <div className="bg-[var(--canvas-inset)] p-4 sm:p-5 rounded-xl border border-[var(--hairline)]">
            <span className="block text-xs uppercase font-mono text-[var(--ink-mute)]">Max Age Limit ({category})</span>
            <span className="text-xl sm:text-3xl font-extrabold text-[var(--ink-primary)] font-mono-num block mt-1">
              {result.maxAgeAllowed} Years
            </span>
          </div>
        </div>

        {/* Detailed Timeline Parameters */}
        <div className="pt-4 border-t border-[var(--hairline)] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)] flex justify-between items-center">
            <span className="text-[var(--ink-mute)]">Minimum Born On or After:</span>
            <span className="font-mono font-semibold text-[var(--ink-primary)]">{result.dobBounds.minDobStr}</span>
          </div>

          <div className="p-3 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)] flex justify-between items-center">
            <span className="text-[var(--ink-mute)]">Maximum Born On or Before:</span>
            <span className="font-mono font-semibold text-[var(--ink-primary)]">{result.dobBounds.maxDobStr}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
