import { describe, it, expect } from 'vitest';
import { validateObservation } from '../src/services/validation.service';
import type { ParsedObservation } from '../src/types/ocr.types';

function makeObservation(overrides: Partial<ParsedObservation> = {}): ParsedObservation {
  return {
    testName: 'Hemoglobin',
    rawValue: '11.2',
    numericValue: 11.2,
    unit: 'g/dL',
    refLow: 12.0,
    refHigh: 16.0,
    ...overrides,
  };
}

describe('validateObservation', () => {
  it('passes a well-formed observation', () => {
    const result = validateObservation(makeObservation());
    expect(result.isValid).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });

  it('flags a non-numeric value (e.g. "11.2*")', () => {
    const result = validateObservation(
      makeObservation({ numericValue: null, rawValue: '11.2*' })
    );
    expect(result.isValid).toBe(false);
    expect(result.reasons).toContain('value is not a valid number');
  });

  it('flags a missing unit', () => {
    const result = validateObservation(makeObservation({ unit: null }));
    expect(result.isValid).toBe(false);
    expect(result.reasons).toContain('unit is missing');
  });

  it('flags both value and unit issues at once', () => {
    const result = validateObservation(
      makeObservation({ numericValue: null, unit: null })
    );
    expect(result.isValid).toBe(false);
    expect(result.reasons).toHaveLength(2);
  });
});
