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
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Input Card */}
      <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl p-6 sm:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors">
        <div className="flex items-center justify-between pb-5 border-b border-[var(--hairline)]">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏖️</span>
            <h2 className="text-lg font-semibold tracking-tight text-[var(--ink-primary)]">
              Retirement & Pension Age Countdown Engine
            </h2>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-md text-[var(--ink-body)]">
            Target Cap: {activeRetirementAge} Yrs
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
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

          {/* Work Joining Age Input with Unified Seamless Stepper */}
          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wider text-[var(--ink-body)]">
              Work / Career Joining Age <span className="text-[#ee0000]">*</span>
            </label>
            <div className="flex items-center h-11 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[var(--ink-primary)] transition">
              <button
                type="button"
                onClick={() => setCareerStartAge((prev) => Math.max(15, prev - 1))}
                className="h-full px-3.5 bg-[var(--canvas-inset)] text-[var(--ink-primary)] hover:bg-[var(--hairline)] transition flex items-center justify-center cursor-pointer select-none border-r border-[var(--hairline)]"
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
                className="w-full h-full text-center bg-transparent text-sm font-mono font-bold text-[var(--ink-primary)] no-spinner focus:outline-none outline-none border-none ring-0 focus:ring-0 shadow-none"
              />
              <button
                type="button"
                onClick={() => setCareerStartAge((prev) => Math.min(85, prev + 1))}
                className="h-full px-3.5 bg-[var(--canvas-inset)] text-[var(--ink-primary)] hover:bg-[var(--hairline)] transition flex items-center justify-center cursor-pointer select-none border-l border-[var(--hairline)]"
                aria-label="Increase joining age"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Retirement Target Age Selector */}
          <div className="space-y-2 md:col-span-1">
            <label className="block text-xs font-medium uppercase tracking-wider text-[var(--ink-body)]">
              Target Retirement Age <span className="text-[#ee0000]">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {presetAges.map((age) => (
                <button
                  key={age}
                  type="button"
                  onClick={() => {
                    setIsCustomRetirement(false);
                    setRetirementAge(age);
                  }}
                  className={`px-2.5 py-1.5 text-xs font-mono font-medium rounded-lg border transition cursor-pointer select-none ${
                    !isCustomRetirement && retirementAge === age
                      ? 'bg-[var(--ink-primary)] text-[var(--canvas-card)] border-[var(--ink-primary)] shadow-sm'
                      : 'bg-[var(--canvas-card)] text-[var(--ink-body)] border-[var(--hairline)] hover:border-[var(--ink-primary)]'
                  }`}
                >
                  {age} {age === 60 ? '(Govt)' : age === 73 ? '(RMD)' : ''}
                </button>
              ))}

              {/* Manual / Custom Option Button */}
              <button
                type="button"
                onClick={() => setIsCustomRetirement(true)}
                className={`px-2.5 py-1.5 text-xs font-mono font-medium rounded-lg border transition flex items-center gap-1 cursor-pointer select-none ${
                  isCustomRetirement
                    ? 'bg-[var(--ink-primary)] text-[var(--canvas-card)] border-[var(--ink-primary)] shadow-sm'
                    : 'bg-[var(--canvas-card)] text-[var(--ink-body)] border-[var(--hairline)] hover:border-[var(--ink-primary)]'
                }`}
              >
                <Sliders className="w-3 h-3" /> Manual
              </button>
            </div>

            {/* Custom Retirement Age Input Field with Unified Seamless Stepper */}
            {isCustomRetirement && (
              <div className="mt-2.5 animate-fade-in-down flex items-center h-10 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[var(--ink-primary)] transition">
                <button
                  type="button"
                  onClick={() => {
                    const current = parseInt(customRetirementInput, 10) || 60;
                    setCustomRetirementInput(String(Math.max(30, current - 1)));
                  }}
                  className="h-full px-3.5 bg-[var(--canvas-inset)] text-[var(--ink-primary)] hover:bg-[var(--hairline)] transition flex items-center justify-center cursor-pointer select-none border-r border-[var(--hairline)]"
                  aria-label="Decrease custom retirement age"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min={30}
                  max={100}
                  value={customRetirementInput}
                  onChange={(e) => setCustomRetirementInput(e.target.value)}
                  placeholder="e.g. 55"
                  className="w-full h-full text-center bg-transparent text-sm font-mono font-bold text-[var(--ink-primary)] no-spinner focus:outline-none outline-none border-none ring-0 focus:ring-0 shadow-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const current = parseInt(customRetirementInput, 10) || 60;
                    setCustomRetirementInput(String(Math.min(100, current + 1)));
                  }}
                  className="h-full px-3.5 bg-[var(--canvas-inset)] text-[var(--ink-primary)] hover:bg-[var(--hairline)] transition flex items-center justify-center cursor-pointer select-none border-l border-[var(--hairline)]"
                  aria-label="Increase custom retirement age"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Results Card */}
      {currentAge && retirementDate && remaining ? (
        <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl p-6 sm:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative transition-colors animate-fade-in-down">
          <div className="flex items-center justify-between pb-6 border-b border-[var(--hairline)]">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#0070f3]" />
              <span className="text-xs uppercase font-mono tracking-wider text-[var(--ink-mute)]">Retirement Timeline Analysis</span>
            </div>

            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--ink-primary)] bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-lg hover:border-[var(--ink-primary)] transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#0070f3]" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Summary'}
            </button>
          </div>

          {/* Big Remaining Time Display */}
          {remaining.isRetired ? (
            <div className="my-8 p-6 bg-[var(--canvas-inset)] border border-[var(--hairline)] text-center rounded-xl">
              <h3 className="text-2xl font-extrabold text-[#0070f3]">🎉 Congratulations! You are already retired!</h3>
              <p className="text-xs text-[var(--ink-mute)] mt-1">You reached your target retirement age of {activeRetirementAge} on {formatDateForInput(retirementDate)}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 my-6 text-center">
              <div className="bg-[var(--canvas-inset)] p-5 rounded-xl border border-[var(--hairline)]">
                <span className="block text-3xl sm:text-4xl font-extrabold text-[var(--ink-primary)] font-mono-num">
                  {remaining.years}
                </span>
                <span className="text-xs uppercase font-mono text-[var(--ink-mute)]">Years Left</span>
              </div>
              <div className="bg-[var(--canvas-inset)] p-5 rounded-xl border border-[var(--hairline)]">
                <span className="block text-3xl sm:text-4xl font-extrabold text-[var(--ink-primary)] font-mono-num">
                  {remaining.months}
                </span>
                <span className="text-xs uppercase font-mono text-[var(--ink-mute)]">Months Left</span>
              </div>
              <div className="bg-[var(--canvas-inset)] p-5 rounded-xl border border-[var(--hairline)]">
                <span className="block text-3xl sm:text-4xl font-extrabold text-[var(--ink-primary)] font-mono-num">
                  {remaining.days}
                </span>
                <span className="text-xs uppercase font-mono text-[var(--ink-mute)]">Days Left</span>
              </div>
            </div>
          )}

          {/* Customized Progress Bar */}
          <div className="space-y-2 my-6 p-4 bg-[var(--canvas-inset)] rounded-xl border border-[var(--hairline)]">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[var(--ink-body)]">Career Milestone Progress (Age {careerStartAge} to {activeRetirementAge})</span>
              <span className="font-bold text-[var(--ink-primary)]">{progressPercent}% Completed</span>
            </div>
            <div className="w-full bg-[var(--canvas-card)] h-3 rounded-full overflow-hidden border border-[var(--hairline)] p-0.5">
              <div
                className="bg-[#0070f3] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Breakdown Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[var(--hairline)] text-xs">
            <div className="p-3 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)]">
              <span className="block text-[var(--ink-mute)] font-mono uppercase">Current Exact Age</span>
              <span className="text-sm font-bold text-[var(--ink-primary)] font-mono-num">
                {currentAge.years} yrs, {currentAge.months} mos
              </span>
            </div>

            <div className="p-3 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)]">
              <span className="block text-[var(--ink-mute)] font-mono uppercase">Official Retirement Date</span>
              <span className="text-sm font-bold text-[#0070f3] font-mono-num">
                {formatDateForInput(retirementDate)}
              </span>
            </div>

            <div className="p-3 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)]">
              <span className="block text-[var(--ink-mute)] font-mono uppercase">Total Days to Target</span>
              <span className="text-sm font-bold text-[var(--ink-primary)] font-mono-num">
                {remaining.totalDays.toLocaleString()} Days
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl text-center space-y-2">
          <Briefcase className="w-8 h-8 mx-auto text-[#0070f3]/60" />
          <h3 className="text-sm font-semibold text-[var(--ink-primary)]">Ready for Retirement Calculation</h3>
          <p className="text-xs text-[var(--ink-mute)] max-w-sm mx-auto">
            Enter your Date of Birth in the input box above to instantly calculate your retirement countdown, official pension date, and career progress.
          </p>
        </div>
      )}
    </div>
  );
};
