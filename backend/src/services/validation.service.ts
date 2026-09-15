import type { ParsedObservation } from '../types/ocr.types';

export interface ValidationResult {
  isValid: boolean;
  reasons: string[];
}

/**
 * Basic sanity checks required before an observation is trusted:
 * - the value must be a real number (not "11.2*" or similar)
 * - a unit must be present
 * Observations that fail are still returned upstream, just flagged
 * in meta.needsReview[].
 */
export function validateObservation(parsed: ParsedObservation): ValidationResult {
  const reasons: string[] = [];

  if (parsed.numericValue === null) {
    reasons.push('value is not a valid number');
  }

  if (!parsed.unit) {
    reasons.push('unit is missing');
  }

  return {
    isValid: reasons.length === 0,
    reasons,
  };
}
