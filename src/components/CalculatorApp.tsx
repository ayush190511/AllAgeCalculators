import React, { useState, useEffect } from 'react';
import { UPSCMode } from './modes/UPSCMode';
import { NormalAgeMode } from './modes/NormalAgeMode';
import { DateDiffMode } from './modes/DateDiffMode';
import { RelaxationTable } from './RelaxationTable';
import { ShieldCheck, Calendar, ArrowRightLeft } from 'lucide-react';

export type ModeType = 'upsc' | 'normal' | 'datediff';

export const CalculatorApp: React.FC = () => {
  const [mode, setMode] = useState<ModeType>('upsc');
  // Shared DOB state maintained across modes (empty by default)
  const [sharedDob, setSharedDob] = useState<string>('');

  // URL query parameter sync for sharing exact calculation view
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlMode = params.get('mode') as ModeType;
      const urlDob = params.get('dob');
      if (urlMode && ['upsc', 'normal', 'datediff'].includes(urlMode)) {
        setMode(urlMode);
      }
      if (urlDob) {
        setSharedDob(urlDob);
      }
    }
  }, []);

  const handleModeChange = (newMode: ModeType) => {
    setMode(newMode);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('mode', newMode);
      url.searchParams.set('dob', sharedDob);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleDobChange = (newDob: string) => {
    setSharedDob(newDob);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('dob', newDob);
      window.history.replaceState({}, '', url.toString());
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 sm:space-y-8">
      {/* Three Hero Mode Cards / Tabs directly at top of the page */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3.5 p-1.5 sm:p-2.5 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-xl sm:rounded-2xl md:rounded-3xl shadow-xs transition-colors">
        {/* Mode 1 Tab */}
        <button
          type="button"
          onClick={() => handleModeChange('upsc')}
          className={`p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl md:rounded-2xl text-left transition-all flex items-start gap-2.5 sm:gap-3.5 relative cursor-pointer ${
            mode === 'upsc'
              ? 'bg-[var(--canvas-card)] text-[var(--ink-primary)] border border-[var(--hairline)] shadow-sm'
              : 'text-[var(--ink-body)] hover:text-[var(--ink-primary)] hover:bg-[var(--canvas-card)]/60 border border-transparent'
          }`}
        >
          <div
            className={`p-2 sm:p-3 rounded-lg sm:rounded-xl shrink-0 transition-colors ${
              mode === 'upsc' ? 'bg-[#0070f3] text-white shadow-xs' : 'bg-[var(--hairline)] text-[var(--ink-body)]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] sm:text-xs uppercase font-mono tracking-wider font-bold text-[var(--ink-mute)]">Mode 1</span>
              {mode === 'upsc' && <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-[#0070f3] animate-pulse" />}
            </div>
            <h3 className="text-xs sm:text-sm md:text-base font-bold tracking-tight mt-0.5">UPSC Age & Eligibility</h3>
            <p className="text-[11px] sm:text-xs text-[var(--ink-mute)] line-clamp-1 mt-0.5">
              Exact 1st August cutoff, attempt counter & relaxations
            </p>
          </div>
        </button>

        {/* Mode 2 Tab */}
        <button
          type="button"
          onClick={() => handleModeChange('normal')}
          className={`p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl md:rounded-2xl text-left transition-all flex items-start gap-2.5 sm:gap-3.5 relative cursor-pointer ${
            mode === 'normal'
              ? 'bg-[var(--canvas-card)] text-[var(--ink-primary)] border border-[var(--hairline)] shadow-sm'
              : 'text-[var(--ink-body)] hover:text-[var(--ink-primary)] hover:bg-[var(--canvas-card)]/60 border border-transparent'
          }`}
        >
          <div
            className={`p-2 sm:p-3 rounded-lg sm:rounded-xl shrink-0 transition-colors ${
              mode === 'normal' ? 'bg-[#0070f3] text-white shadow-xs' : 'bg-[var(--hairline)] text-[var(--ink-body)]'
            }`}
          >
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] sm:text-xs uppercase font-mono tracking-wider font-bold text-[var(--ink-mute)]">Mode 2</span>
              {mode === 'normal' && <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-[#0070f3] animate-pulse" />}
            </div>
            <h3 className="text-xs sm:text-sm md:text-base font-bold tracking-tight mt-0.5">Normal Age Calculator</h3>
            <p className="text-[11px] sm:text-xs text-[var(--ink-mute)] line-clamp-1 mt-0.5">
              Exact age as of today + live second-by-second ticker
            </p>
          </div>
        </button>

        {/* Mode 3 Tab */}
        <button
          type="button"
          onClick={() => handleModeChange('datediff')}
          className={`p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl md:rounded-2xl text-left transition-all flex items-start gap-2.5 sm:gap-3.5 relative cursor-pointer ${
            mode === 'datediff'
              ? 'bg-[var(--canvas-card)] text-[var(--ink-primary)] border border-[var(--hairline)] shadow-sm'
              : 'text-[var(--ink-body)] hover:text-[var(--ink-primary)] hover:bg-[var(--canvas-card)]/60 border border-transparent'
          }`}
        >
          <div
            className={`p-2 sm:p-3 rounded-lg sm:rounded-xl shrink-0 transition-colors ${
              mode === 'datediff' ? 'bg-[#7928ca] text-white shadow-xs' : 'bg-[var(--hairline)] text-[var(--ink-body)]'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] sm:text-xs uppercase font-mono tracking-wider font-bold text-[var(--ink-mute)]">Mode 3</span>
              {mode === 'datediff' && <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-[#7928ca] animate-pulse" />}
            </div>
            <h3 className="text-xs sm:text-sm md:text-base font-bold tracking-tight mt-0.5">Date Difference</h3>
            <p className="text-[11px] sm:text-xs text-[var(--ink-mute)] line-clamp-1 mt-0.5">
              Age gaps, event intervals & unit breakdowns
            </p>
          </div>
        </button>
      </div>

      {/* Active Mode Render */}
      <div>
        {mode === 'upsc' && <UPSCMode dob={sharedDob} onDobChange={handleDobChange} />}
        {mode === 'normal' && <NormalAgeMode dob={sharedDob} onDobChange={handleDobChange} />}
        {mode === 'datediff' && <DateDiffMode />}
      </div>

      {/* Collapsible Category Relaxation Reference Matrix */}
      <RelaxationTable />
    </div>
  );
};
