import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Table, Info } from 'lucide-react';

export const RelaxationTable: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl overflow-hidden shadow-sm transition-colors">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-[var(--canvas-card)] hover:bg-[var(--canvas-inset)] transition text-left"
      >
        <div className="flex items-center gap-2.5">
          <Table className="w-4 h-4 text-[#0070f3]" />
          <div>
            <h3 className="text-sm font-semibold text-[var(--ink-primary)] tracking-tight">
              Official UPSC Category Age Relaxation & Attempt Limits Table
            </h3>
            <p className="text-xs text-[var(--ink-mute)]">
              Reference guide for General, EWS, OBC, SC, ST, PwBD, Ex-Servicemen & J&K Domiciles
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--canvas-inset)] border border-[var(--hairline)] text-[var(--ink-body)]">
            {isOpen ? 'Collapse Table' : 'Expand Matrix'}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-[var(--ink-primary)]" /> : <ChevronDown className="w-4 h-4 text-[var(--ink-mute)]" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-6 border-t border-[var(--hairline)] bg-[var(--canvas-inset)] space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--hairline)] bg-[var(--canvas-card)] text-[var(--ink-mute)] uppercase font-mono">
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Min Age</th>
                  <th className="py-3 px-4 font-semibold">Max Age (Base)</th>
                  <th className="py-3 px-4 font-semibold">Attempt Limit</th>
                  <th className="py-3 px-4 font-semibold">Crucial Cutoff Date</th>
                  <th className="py-3 px-4 font-semibold">Key Relaxations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--hairline)] bg-[var(--canvas-card)] font-mono-num text-[var(--ink-primary)]">
                <tr className="hover:bg-[var(--canvas-inset)] transition">
                  <td className="py-3 px-4 font-bold text-[var(--ink-primary)]">General (GEN)</td>
                  <td className="py-3 px-4">21 Years</td>
                  <td className="py-3 px-4">32 Years</td>
                  <td className="py-3 px-4 font-bold">6 Attempts</td>
                  <td className="py-3 px-4">1st August of Exam Year</td>
                  <td className="py-3 px-4 text-[var(--ink-mute)] font-sans">None (Standard baseline)</td>
                </tr>
                <tr className="hover:bg-[var(--canvas-inset)] transition">
                  <td className="py-3 px-4 font-bold text-[var(--ink-primary)]">EWS (Economically Weaker)</td>
                  <td className="py-3 px-4">21 Years</td>
                  <td className="py-3 px-4">32 Years</td>
                  <td className="py-3 px-4 font-bold">6 Attempts</td>
                  <td className="py-3 px-4">1st August of Exam Year</td>
                  <td className="py-3 px-4 text-[var(--ink-mute)] font-sans">Income/asset eligibility criteria applies</td>
                </tr>
                <tr className="hover:bg-[var(--canvas-inset)] transition">
                  <td className="py-3 px-4 font-bold text-[var(--ink-primary)]">OBC (Non-Creamy Layer)</td>
                  <td className="py-3 px-4">21 Years</td>
                  <td className="py-3 px-4 font-bold text-[#0070f3]">35 Years (+3 Yrs)</td>
                  <td className="py-3 px-4 font-bold">9 Attempts</td>
                  <td className="py-3 px-4">1st August of Exam Year</td>
                  <td className="py-3 px-4 text-[var(--ink-body)] font-sans">+3 years age relaxation, 9 attempts</td>
                </tr>
                <tr className="hover:bg-[var(--canvas-inset)] transition">
                  <td className="py-3 px-4 font-bold text-[var(--ink-primary)]">Scheduled Caste (SC)</td>
                  <td className="py-3 px-4">21 Years</td>
                  <td className="py-3 px-4 font-bold text-[#0070f3]">37 Years (+5 Yrs)</td>
                  <td className="py-3 px-4 font-bold text-[#0070f3]">Unlimited</td>
                  <td className="py-3 px-4">1st August of Exam Year</td>
                  <td className="py-3 px-4 text-[var(--ink-body)] font-sans">+5 years age relaxation, unlimited attempts</td>
                </tr>
                <tr className="hover:bg-[var(--canvas-inset)] transition">
                  <td className="py-3 px-4 font-bold text-[var(--ink-primary)]">Scheduled Tribe (ST)</td>
                  <td className="py-3 px-4">21 Years</td>
                  <td className="py-3 px-4 font-bold text-[#0070f3]">37 Years (+5 Yrs)</td>
                  <td className="py-3 px-4 font-bold text-[#0070f3]">Unlimited</td>
                  <td className="py-3 px-4">1st August of Exam Year</td>
                  <td className="py-3 px-4 text-[var(--ink-body)] font-sans">+5 years age relaxation, unlimited attempts</td>
                </tr>
                <tr className="hover:bg-[var(--canvas-inset)] transition bg-[var(--canvas-inset)]">
                  <td className="py-3 px-4 font-bold text-[var(--ink-primary)]">PwBD (Disabilities)</td>
                  <td className="py-3 px-4">21 Years</td>
                  <td className="py-3 px-4 font-bold text-[#7928ca]">+10 Years (42-47)</td>
                  <td className="py-3 px-4 font-bold">9 (GEN/OBC) / Unlimited (SC/ST)</td>
                  <td className="py-3 px-4">1st August of Exam Year</td>
                  <td className="py-3 px-4 text-[var(--ink-body)] font-sans">+10 years added across all categories</td>
                </tr>
                <tr className="hover:bg-[var(--canvas-inset)] transition bg-[var(--canvas-inset)]">
                  <td className="py-3 px-4 font-bold text-[var(--ink-primary)]">Ex-Servicemen (ECO/SSCO)</td>
                  <td className="py-3 px-4">21 Years</td>
                  <td className="py-3 px-4 font-bold text-[#7928ca]">+5 Years (Cap 37)</td>
                  <td className="py-3 px-4">As per Category</td>
                  <td className="py-3 px-4">1st August of Exam Year</td>
                  <td className="py-3 px-4 text-[var(--ink-body)] font-sans">Must have minimum 5 years military service</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex items-start gap-2 p-3 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg text-xs text-[var(--ink-mute)]">
            <Info className="w-4 h-4 text-[#0070f3] shrink-0 mt-0.5" />
            <span>
              <strong>Crucial Rule Note:</strong> Age calculation is strictly as on <strong>1st August</strong> of the target exam year (Rule 6 of UPSC CSE Gazette Notification). Candidates born on 1st August are considered to have completed the exact age on that date.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
