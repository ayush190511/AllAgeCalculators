import type { Category, RelaxationOptions, UPSCEligibilityResult } from './types';
import { calculateExactYMD, formatDateHuman } from './date-utils';

/**
 * UPSC Civil Services Examination (CSE) Age & Eligibility Engine
 */
export function calculateUPSCEligibility(
  dob: Date,
  targetExamYear: number,
  category: Category,
  relaxations: RelaxationOptions
): UPSCEligibilityResult {
  // Cutoff date is strictly 1st August of the target exam year
  const cutoffDate = new Date(targetExamYear, 7, 1); // Month 7 is August (0-indexed)

  const ageOnCutoff = calculateExactYMD(dob, cutoffDate);

  // Minimum age threshold
  const minAge = 21;

  // Base Max Age & Attempts
  let baseMaxAge = 32;
  let attemptsAllowed: number | 'Unlimited' = 6;

  switch (category) {
    case 'GEN':
    case 'EWS':
      baseMaxAge = 32;
      attemptsAllowed = 6;
      break;
    case 'OBC':
      baseMaxAge = 35;
      attemptsAllowed = 9;
      break;
    case 'SC':
    case 'ST':
      baseMaxAge = 37;
      attemptsAllowed = 'Unlimited';
      break;
  }

  // Calculate Maximum Age & Attempt Modifications based on Relaxations
  let maxAgeAllowed = baseMaxAge;
  const relaxationsApplied: string[] = [];

  // PwBD Relaxation (+10 years across categories)
  if (relaxations.pwbd) {
    maxAgeAllowed += 10;
    relaxationsApplied.push('PwBD (+10 years)');
    if (category === 'GEN' || category === 'EWS') {
      attemptsAllowed = 9; // PwBD GEN/EWS get 9 attempts
    }
  }

  // Ex-Servicemen (+5 years, cap at 37 for GEN/EWS unless category allows higher)
  if (relaxations.exServicemen) {
    if (!relaxations.pwbd) {
      if (category === 'GEN' || category === 'EWS') {
        maxAgeAllowed = Math.max(maxAgeAllowed, 37);
        relaxationsApplied.push('Ex-Servicemen (+5 years cap)');
      } else {
        maxAgeAllowed += 5;
        relaxationsApplied.push('Ex-Servicemen (+5 years)');
      }
    }
  }

  // Defence Disabled in Operations (+3 yrs GEN/OBC, +8 SC/ST)
  if (relaxations.defenceOps) {
    const defenceBonus = (category === 'SC' || category === 'ST') ? 8 : 3;
    maxAgeAllowed += defenceBonus;
    relaxationsApplied.push(`Defence Ops Disabled (+${defenceBonus} years)`);
  }

  // J&K Domicile (+2 years)
  if (relaxations.jkDomicile) {
    maxAgeAllowed += 2;
    relaxationsApplied.push('J&K Domicile (+2 years)');
  }

  // Determine Eligibility Status
  let status: 'eligible' | 'overage' | 'underage' = 'eligible';

  // Calculate decimal age for precise threshold checking
  // Candidate is underage if on 1st Aug of exam year they are < 21 years old
  if (ageOnCutoff.years < minAge) {
    status = 'underage';
  } else if (ageOnCutoff.years > maxAgeAllowed) {
    status = 'overage';
  } else if (ageOnCutoff.years === maxAgeAllowed) {
    // If exact age is maxAgeAllowed years, 0 months, 0 days, they are ELIGIBLE (born on 1st August).
    // If days or months > 0, they turned maxAgeAllowed + 1 day before 1st Aug, so OVERAGE.
    if (ageOnCutoff.months > 0 || ageOnCutoff.days > 0) {
      status = 'overage';
    }
  }

  // Attempts Remaining & Exam Cycles Remaining
  let attemptsRemaining: number | 'Unlimited' = attemptsAllowed;
  let yearsRemaining = 0;

  if (status === 'eligible') {
    yearsRemaining = maxAgeAllowed - ageOnCutoff.years;
    if (ageOnCutoff.months > 0 || ageOnCutoff.days > 0) {
      // e.g. age 28 years 5 months on 1st Aug 2026 -> turning 29 during year 2026, so maxAgeAllowed (32) - 28 = 4 cycles left (2026, 2027, 2028, 2029)
    } else {
      yearsRemaining += 1;
    }

    if (typeof attemptsAllowed === 'number') {
      attemptsRemaining = Math.min(attemptsAllowed, yearsRemaining);
    }
  } else if (status === 'underage') {
    yearsRemaining = maxAgeAllowed - ageOnCutoff.years;
    attemptsRemaining = attemptsAllowed;
  } else {
    yearsRemaining = 0;
    attemptsRemaining = 0;
  }

  // DOB Bounds for this Exam Year & Category
  const minDobYear = targetExamYear - maxAgeAllowed;
  const maxDobYear = targetExamYear - minAge;

  const minDobDate = new Date(minDobYear, 7, 2); // 2nd August
  const maxDobDate = new Date(maxDobYear, 7, 1); // 1st August

  const cutoffDateStr = formatDateHuman(cutoffDate);
  const minDobStr = formatDateHuman(minDobDate);
  const maxDobStr = formatDateHuman(maxDobDate);

  // Plain-English Explainer
  let explanation = '';
  if (status === 'eligible') {
    explanation = `For UPSC CSE ${targetExamYear}, the crucial cutoff date is ${cutoffDateStr}. On this date, you will be ${ageOnCutoff.years} years, ${ageOnCutoff.months} months, and ${ageOnCutoff.days} days old. Since your age falls between the required ${minAge} and ${maxAgeAllowed} years threshold for ${category}${relaxationsApplied.length > 0 ? ` with ${relaxationsApplied.join(', ')}` : ''}, you are fully ELIGIBLE to apply!`;
  } else if (status === 'underage') {
    const yearsUnder = minAge - ageOnCutoff.years;
    explanation = `For UPSC CSE ${targetExamYear}, the cutoff date is ${cutoffDateStr}. On this date, you will be ${ageOnCutoff.years} years, ${ageOnCutoff.months} months, and ${ageOnCutoff.days} days old. Candidates must be at least 21 years old on ${cutoffDateStr}. You will become eligible for UPSC in the ${targetExamYear + yearsUnder} examination cycle.`;
  } else {
    explanation = `For UPSC CSE ${targetExamYear}, the cutoff date is ${cutoffDateStr}. On this date, your calculated age is ${ageOnCutoff.years} years, ${ageOnCutoff.months} months, and ${ageOnCutoff.days} days, which exceeds the maximum upper age limit of ${maxAgeAllowed} years for ${category}${relaxationsApplied.length > 0 ? ` (including relaxations: ${relaxationsApplied.join(', ')})` : ''}. To be eligible for ${targetExamYear}, your birth date must be on or after ${minDobStr}.`;
  }

  return {
    status,
    ageOnCutoff,
    cutoffDateStr,
    cutoffDate,
    minAge,
    maxAgeAllowed,
    attemptsAllowed,
    attemptsRemaining,
    yearsRemaining,
    explanation,
    dobBounds: {
      minDobStr,
      maxDobStr,
    },
    relaxationsApplied,
  };
}
