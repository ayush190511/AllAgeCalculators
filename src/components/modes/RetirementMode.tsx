import React, { useState, useEffect, useMemo } from 'react';
import { calculateAgeBreakdown, calculateDateDifference, formatDateForInput } from '../../lib/date-utils';
import { DateInputField } from '../DateInputField';
import { Briefcase, Calendar, Clock, Copy, Check, ShieldCheck, Award, Sliders, Plus, Minus } from 'lucide-react';

interface RetirementModeProps {
  initialDob?: string;
}

export const RetirementMode: React.FC<RetirementModeProps> = ({ initialDob = '' }) => {
  const [dob, setDob] = useState<string>(initialDob);
  const [retirementAge, setRetirementAge] = useState<number>(60); // Default 60
  const [isCustomRetirement, setIsCustomRetirement] = useState<boolean>(false);
  const [customRetirementInput, setCustomRetirementInput] = useState<string>('60');

  // User-configurable Career Start Age (Work Joining Age)
  const [careerStartAge, setCareerStartAge] = useState<number>(22);

  const [copied, setCopied] = useState<boolean>(false);

  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    setDob(initialDob || '');
  }, [initialDob]);

  const parsedDob = useMemo(() => {
    if (!dob) return null;
    const [y, m, d] = dob.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [dob]);

  // Calculate current exact age
  const currentAge = useMemo(() => {
    if (!parsedDob) return null;
    return calculateAgeBreakdown(parsedDob, today);
  }, [parsedDob, today]);

  // Active Retirement Target Age
  const activeRetirementAge = useMemo(() => {
    if (isCustomRetirement) {
      const parsed = parseInt(customRetirementInput, 10);
      return isNaN(parsed) || parsed <= 0 ? 60 : parsed;
    }
    return retirementAge;
  }, [isCustomRetirement, customRetirementInput, retirementAge]);

  // Calculate retirement date (DOB + activeRetirementAge years)
  const retirementDate = useMemo(() => {
    if (!parsedDob) return null;
    const ret = new Date(parsedDob);
    ret.setFullYear(ret.getFullYear() + activeRetirementAge);
    return ret;
  }, [parsedDob, activeRetirementAge]);

  // Calculate time remaining until retirement
  const remaining = useMemo(() => {
    if (!retirementDate) return null;
    if (today >= retirementDate) {
      return { isRetired: true, years: 0, months: 0, days: 0, totalDays: 0 };
    }
    const diff = calculateDateDifference(today, retirementDate);
    return { isRetired: false, ...diff };
  }, [today, retirementDate]);

  // Career progress percentage based on custom Joining Age and Target Retirement Age
  const progressPercent = useMemo(() => {
    if (!currentAge) return 0;
    const totalWorkingYears = Math.max(1, activeRetirementAge - careerStartAge);
    const yearsWorked = Math.max(0, currentAge.years - careerStartAge);
    const pct = Math.min(100, Math.max(0, (yearsWorked / totalWorkingYears) * 100));
    return Math.round(pct);
  }, [currentAge, activeRetirementAge, careerStartAge]);

  const handleCopySummary = () => {
    if (!currentAge || !retirementDate || !remaining) return;
    const text = `🏖️ Retirement Countdown Summary
📅 Date of Birth: ${dob}
💼 Work Joining Age: ${careerStartAge} Years
🎯 Target Retirement Age: ${activeRetirementAge} Years
📅 Official Retirement Date: ${formatDateForInput(retirementDate)}
⏳ Current Age: ${currentAge.years} yrs, ${currentAge.months} mos, ${currentAge.days} days
⏱️ Time Remaining: ${remaining.isRetired ? 'Already Retired!' : `${remaining.years} yrs, ${remaining.months} mos, ${remaining.days} days`}
📊 Career Progress: ${progressPercent}% Completed
📍 Calculated via allagecalculators.com/retirement-age-calculator`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presetAges = [58, 60, 62, 65, 70, 73];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Input Card */}
      <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl p-4 sm:p-5 md:p-6 shadow-xs transition-colors">
        <div className="flex items-center justify-between pb-3.5 border-b border-[var(--hairline)]">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏖️</span>
            <h2 className="text-sm sm:text-base font-semibold tracking-tight text-[var(--ink-primary)]">
              Retirement & Pension Countdown Engine
            </h2>
          </div>
          <span className="text-[11px] sm:text-xs font-mono px-2.5 py-1 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-md text-[var(--ink-body)]">
            Target: {activeRetirementAge} Years
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-4">
          {/* DOB */}
          <DateInputField
            label="Your Date of Birth"
            value={dob}
            max={formatDateForInput(today)}
            onChange={(val) => {
              const maxStr = formatDateForInput(today);
              const clamped = val > maxStr ? maxStr : val;
              setDob(clamped);
            }}
          />

          {/* Steppers & Target */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Work Joining Age Stepper */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium uppercase tracking-wider text-[var(--ink-body)]">
                Joining Age <span className="text-[#ee0000]">*</span>
              </label>
              <div className="flex items-center h-10 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setCareerStartAge((prev) => Math.max(15, prev - 1))}
                  className="h-full px-3 text-[var(--ink-primary)] hover:bg-[var(--hairline)] transition flex items-center justify-center cursor-pointer select-none"
                  aria-label="Decrease joining age"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min={15}
                  max={85}
                  value={careerStartAge}
                  onChange={(e) => setCareerStartAge(Math.max(10, Math.min(85, Number(e.target.value) || 22)))}
                  className="w-full h-full text-center bg-transparent text-xs sm:text-sm font-mono font-bold text-[var(--ink-primary)] no-spinner focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setCareerStartAge((prev) => Math.min(85, prev + 1))}
                  className="h-full px-3 text-[var(--ink-primary)] hover:bg-[var(--hairline)] transition flex items-center justify-center cursor-pointer select-none"
                  aria-label="Increase joining age"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Target Age Stepper / Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium uppercase tracking-wider text-[var(--ink-body)]">
                Target Age <span className="text-[#ee0000]">*</span>
              </label>
              <select
                value={isCustomRetirement ? 'custom' : retirementAge}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setIsCustomRetirement(true);
                  } else {
                    setIsCustomRetirement(false);
                    setRetirementAge(Number(e.target.value));
                  }
                }}
                className="w-full h-10 px-2.5 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-lg text-xs sm:text-sm font-mono font-bold text-[var(--ink-primary)] focus:outline-none cursor-pointer"
              >
                {presetAges.map((age) => (
                  <option key={age} value={age}>
                    {age} Yrs {age === 60 ? '(Govt)' : age === 73 ? '(RMD)' : ''}
                  </option>
                ))}
                <option value="custom">Custom...</option>
              </select>
            </div>
          </div>

          {isCustomRetirement && (
            <div className="md:col-span-2 flex items-center h-10 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-lg overflow-hidden animate-fade-in-down">
              <button
                type="button"
                onClick={() => {
                  const current = parseInt(customRetirementInput, 10) || 60;
                  setCustomRetirementInput(String(Math.max(30, current - 1)));
                }}
                className="h-full px-3 text-[var(--ink-primary)] hover:bg-[var(--hairline)] transition cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="number"
                min={30}
                max={100}
                value={customRetirementInput}
                onChange={(e) => setCustomRetirementInput(e.target.value)}
                placeholder="Custom Target Retirement Age"
                className="w-full h-full text-center bg-transparent text-xs sm:text-sm font-mono font-bold text-[var(--ink-primary)] no-spinner focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  const current = parseInt(customRetirementInput, 10) || 60;
                  setCustomRetirementInput(String(Math.min(100, current + 1)));
                }}
                className="h-full px-3 text-[var(--ink-primary)] hover:bg-[var(--hairline)] transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Results Display */}
      {currentAge && retirementDate && remaining ? (
        <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl p-4 sm:p-5 md:p-6 shadow-xs relative transition-colors animate-fade-in-down">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-[var(--hairline)]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0070f3]" />
              <span className="text-xs uppercase font-mono tracking-wider text-[var(--ink-mute)]">Retirement Countdown</span>
            </div>

            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--ink-primary)] bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-lg hover:border-[var(--ink-primary)] transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#0070f3]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>
          </div>

          {/* Big Remaining Time Display */}
          {remaining.isRetired ? (
            <div className="my-3 p-3.5 bg-[var(--canvas-inset)] border border-[var(--hairline)] text-center rounded-xl">
              <div className="text-lg sm:text-xl font-extrabold text-[#0070f3]">🎉 Already Retired!</div>
              <p className="text-xs text-[var(--ink-mute)] mt-0.5">Target retirement age reached on {formatDateForInput(retirementDate)}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:gap-3.5 my-3 text-center">
              <div className="bg-[var(--canvas-inset)] p-2.5 sm:p-3.5 rounded-xl border border-[var(--hairline)] min-w-0">
                <span className="block text-xl sm:text-2xl md:text-3xl font-extrabold text-[var(--ink-primary)] font-mono-num truncate">
                  {remaining.years}
                </span>
                <span className="text-[11px] uppercase font-mono text-[var(--ink-mute)] block mt-0.5">Years Left</span>
              </div>
              <div className="bg-[var(--canvas-inset)] p-2.5 sm:p-3.5 rounded-xl border border-[var(--hairline)] min-w-0">
                <span className="block text-xl sm:text-2xl md:text-3xl font-extrabold text-[var(--ink-primary)] font-mono-num truncate">
                  {remaining.months}
                </span>
                <span className="text-[11px] uppercase font-mono text-[var(--ink-mute)] block mt-0.5">Months Left</span>
              </div>
              <div className="bg-[var(--canvas-inset)] p-2.5 sm:p-3.5 rounded-xl border border-[var(--hairline)] min-w-0">
                <span className="block text-xl sm:text-2xl md:text-3xl font-extrabold text-[var(--ink-primary)] font-mono-num truncate">
                  {remaining.days}
                </span>
                <span className="text-[11px] uppercase font-mono text-[var(--ink-mute)] block mt-0.5">Days Left</span>
              </div>
            </div>
          )}

          {/* Career Progress Bar */}
          <div className="my-3 space-y-1.5 p-3 bg-[var(--canvas-inset)] rounded-xl border border-[var(--hairline)]">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[var(--ink-body)]">Career Track (Age {careerStartAge} &rarr; {activeRetirementAge})</span>
              <span className="font-bold text-[var(--ink-primary)]">{progressPercent}% Completed</span>
            </div>
            <div className="w-full bg-[var(--canvas-card)] h-2.5 rounded-full overflow-hidden border border-[var(--hairline)]">
              <div
                className="bg-[#0070f3] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Timeline Chips */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-3 border-t border-[var(--hairline)] text-xs">
            <div className="p-2.5 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)] min-w-0">
              <span className="block text-[10px] text-[var(--ink-mute)] font-mono uppercase truncate">Current Age</span>
              <span className="text-sm sm:text-base font-bold text-[var(--ink-primary)] font-mono-num block truncate mt-0.5">
                {currentAge.years}y {currentAge.months}m
              </span>
            </div>

            <div className="p-2.5 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)] min-w-0">
              <span className="block text-[10px] text-[var(--ink-mute)] font-mono uppercase truncate">Pension Date</span>
              <span className="text-sm sm:text-base font-bold text-[#0070f3] font-mono-num block truncate mt-0.5">
                {formatDateForInput(retirementDate)}
              </span>
            </div>

            <div className="p-2.5 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)] min-w-0">
              <span className="block text-[10px] text-[var(--ink-mute)] font-mono uppercase truncate">Days Left</span>
              <span className="text-sm sm:text-base font-bold text-[var(--ink-primary)] font-mono-num block truncate mt-0.5">
                {remaining.totalDays.toLocaleString()} Days
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl text-center space-y-1.5">
          <Briefcase className="w-6 h-6 mx-auto text-[#0070f3]" />
          <h3 className="text-sm font-semibold text-[var(--ink-primary)]">Ready for Retirement Calculation</h3>
          <p className="text-xs text-[var(--ink-mute)] max-w-sm mx-auto">
            Enter your Date of Birth in the box above to compute your retirement countdown and pension milestone date.
          </p>
        </div>
      )}
    </div>
  );
};
