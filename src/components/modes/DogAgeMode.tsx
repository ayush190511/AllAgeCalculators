import React, { useState, useMemo } from 'react';
import { calculateDateDifference, formatDateForInput } from '../../lib/date-utils';
import { Dog, Heart, Moon, Copy, Check, Info } from 'lucide-react';

export type DogSize = 'small' | 'medium' | 'large' | 'giant';

export const DogAgeMode: React.FC = () => {
  const [dob, setDob] = useState<string>('2021-04-10');
  const [dogSize, setDogSize] = useState<DogSize>('medium');
  const [copied, setCopied] = useState<boolean>(false);

  const today = useMemo(() => new Date(), []);

  const parsedDob = useMemo(() => {
    if (!dob) return new Date(2021, 3, 10);
    const [y, m, d] = dob.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [dob]);

  // Actual Calendar Age of Dog
  const calendarAge = useMemo(() => {
    return calculateDateDifference(parsedDob, today);
  }, [parsedDob, today]);

  // Veterinary Human Equivalent Age Formula
  const humanAge = useMemo(() => {
    const totalYears = calendarAge.years + calendarAge.months / 12;
    if (totalYears <= 0) return 0;
    if (totalYears <= 1) {
      return Math.round(totalYears * 15);
    }
    if (totalYears <= 2) {
      return Math.round(15 + (totalYears - 1) * 9);
    }
    // After 2 years: size multiplier
    const base = 24;
    const remainingYears = totalYears - 2;
    let multiplier = 5; // default medium
    if (dogSize === 'small') multiplier = 4;
    if (dogSize === 'medium') multiplier = 5;
    if (dogSize === 'large') multiplier = 6;
    if (dogSize === 'giant') multiplier = 7.5;

    return Math.round(base + remainingYears * multiplier);
  }, [calendarAge, dogSize]);

  // Life Stage Determination
  const lifeStage = useMemo(() => {
    if (calendarAge.years < 1) return { name: 'Puppy Stage', sleep: '18–20 hours/day', tip: 'High calorie puppy food, frequent small meals (3–4 times daily).' };
    if (calendarAge.years < 3) return { name: 'Young Adult', sleep: '12–14 hours/day', tip: 'High energy exercise, adult maintenance diet.' };
    if (calendarAge.years < 7) return { name: 'Mature Adult', sleep: '12–14 hours/day', tip: 'Balanced adult diet, regular wellness checkups.' };
    return { name: 'Senior Dog (7+ Yrs)', sleep: '14–18 hours/day', tip: 'Soft joint care food, gentle exercise, bi-annual vet checks.' };
  }, [calendarAge.years]);

  const handleCopySummary = () => {
    const text = `🐶 Dog Age Calculator Summary
📅 Dog Date of Birth: ${dob}
📏 Breed Size: ${dogSize.toUpperCase()}
🎂 Actual Calendar Age: ${calendarAge.years} yrs, ${calendarAge.months} mos
❤️ Human Equivalent Age: ${humanAge} Human Years
🐾 Life Stage: ${lifeStage.name}
📍 Calculated via agecalculatorupsc.com/dog-age-calculator`;

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
            <span className="text-xl">🐶</span>
            <h2 className="text-lg font-semibold tracking-tight text-[var(--ink-primary)]">
              Dog Age & Human Years Conversion Engine
            </h2>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-md text-[var(--ink-body)]">
            AVMA Veterinary Formula
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {/* DOB */}
          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wider text-[var(--ink-body)]">
              Dog's Date of Birth <span className="text-[#ee0000]">*</span>
            </label>
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
          </div>

          {/* Dog Size Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wider text-[var(--ink-body)]">
              Dog Breed Size <span className="text-[#ee0000]">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setDogSize('small')}
                className={`p-2.5 rounded-lg border text-left text-xs font-medium transition ${
                  dogSize === 'small'
                    ? 'bg-[var(--ink-primary)] text-[var(--canvas-card)] border-[var(--ink-primary)]'
                    : 'bg-[var(--canvas-card)] text-[var(--ink-body)] border-[var(--hairline)] hover:border-[var(--ink-primary)]'
                }`}
              >
                <div className="font-bold">Small</div>
                <div className="text-[10px] opacity-80">&lt; 20 lbs</div>
              </button>

              <button
                type="button"
                onClick={() => setDogSize('medium')}
                className={`p-2.5 rounded-lg border text-left text-xs font-medium transition ${
                  dogSize === 'medium'
                    ? 'bg-[var(--ink-primary)] text-[var(--canvas-card)] border-[var(--ink-primary)]'
                    : 'bg-[var(--canvas-card)] text-[var(--ink-body)] border-[var(--hairline)] hover:border-[var(--ink-primary)]'
                }`}
              >
                <div className="font-bold">Medium</div>
                <div className="text-[10px] opacity-80">20–50 lbs</div>
              </button>

              <button
                type="button"
                onClick={() => setDogSize('large')}
                className={`p-2.5 rounded-lg border text-left text-xs font-medium transition ${
                  dogSize === 'large'
                    ? 'bg-[var(--ink-primary)] text-[var(--canvas-card)] border-[var(--ink-primary)]'
                    : 'bg-[var(--canvas-card)] text-[var(--ink-body)] border-[var(--hairline)] hover:border-[var(--ink-primary)]'
                }`}
              >
                <div className="font-bold">Large</div>
                <div className="text-[10px] opacity-80">50–90 lbs</div>
              </button>

              <button
                type="button"
                onClick={() => setDogSize('giant')}
                className={`p-2.5 rounded-lg border text-left text-xs font-medium transition ${
                  dogSize === 'giant'
                    ? 'bg-[var(--ink-primary)] text-[var(--canvas-card)] border-[var(--ink-primary)]'
                    : 'bg-[var(--canvas-card)] text-[var(--ink-body)] border-[var(--hairline)] hover:border-[var(--ink-primary)]'
                }`}
              >
                <div className="font-bold">Giant</div>
                <div className="text-[10px] opacity-80">90+ lbs</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Display */}
      <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl p-6 sm:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative transition-colors">
        <div className="flex items-center justify-between pb-6 border-b border-[var(--hairline)]">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#ee0000]" />
            <span className="text-xs uppercase font-mono tracking-wider text-[var(--ink-mute)]">Human Years Equivalent</span>
          </div>

          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--ink-primary)] bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-lg hover:border-[var(--ink-primary)] transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#0070f3]" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Summary'}
          </button>
        </div>

        {/* Primary Human Equivalent Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6">
          <div className="bg-[var(--canvas-inset)] p-6 rounded-xl border border-[var(--hairline)] flex flex-col justify-center items-center text-center">
            <span className="text-xs font-mono uppercase text-[var(--ink-mute)] mb-1">Human Equivalent Age</span>
            <span className="text-4xl sm:text-5xl font-extrabold text-[#0070f3] font-mono-num">
              {humanAge}
            </span>
            <span className="text-xs text-[var(--ink-body)] mt-1 font-medium">Human Years Old</span>
          </div>

          <div className="bg-[var(--canvas-inset)] p-6 rounded-xl border border-[var(--hairline)] flex flex-col justify-center items-center text-center">
            <span className="text-xs font-mono uppercase text-[var(--ink-mute)] mb-1">Actual Calendar Age</span>
            <span className="text-3xl font-bold text-[var(--ink-primary)] font-mono-num">
              {calendarAge.years} yrs, {calendarAge.months} mos
            </span>
            <span className="text-xs text-[var(--ink-mute)] mt-1">{calendarAge.totalDays.toLocaleString()} Days Lived</span>
          </div>
        </div>

        {/* Life Stage & Care Guidance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[var(--hairline)] text-xs">
          <div className="p-4 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)] space-y-1">
            <span className="block text-[var(--ink-mute)] font-mono uppercase">Life Stage</span>
            <span className="text-base font-bold text-[var(--ink-primary)]">{lifeStage.name}</span>
            <p className="text-[11px] text-[var(--ink-body)]">{lifeStage.tip}</p>
          </div>

          <div className="p-4 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)] space-y-1">
            <div className="flex items-center gap-1 text-[var(--ink-mute)] font-mono uppercase">
              <Moon className="w-3.5 h-3.5 text-[#0070f3]" /> Sleep Requirements
            </div>
            <span className="text-base font-bold text-[var(--ink-primary)]">{lifeStage.sleep}</span>
            <p className="text-[11px] text-[var(--ink-body)]">Tailor sleep environment & rest cycles to this age stage.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
