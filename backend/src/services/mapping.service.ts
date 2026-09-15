import type { ParsedObservation } from '../types/ocr.types';
import type { Observation } from '../types/fhir.types';
import { lookupLoinc } from './loinc.service';

export function mapToFhirObservation(parsed: ParsedObservation): Observation {
  const loinc = lookupLoinc(parsed.testName);

  const observation: Observation = {
    resourceType: 'Observation',
    status: 'preliminary',
    code: {
      coding: loinc
        ? [{ system: 'http://loinc.org', code: loinc.code, display: loinc.display }]
        : [],
      text: parsed.testName,
    },
    valueQuantity: {
      value: parsed.numericValue ?? NaN,
      unit: parsed.unit ?? '',
      system: 'http://unitsofmeasure.org',
      code: parsed.unit ?? '',
    },
  };

  if (parsed.refLow !== null && parsed.refHigh !== null) {
    observation.referenceRange = [
      {
        low: { value: parsed.refLow, unit: parsed.unit ?? '' },
        high: { value: parsed.refHigh, unit: parsed.unit ?? '' },
      },
    ];
  }

  const interpretation = computeInterpretation(parsed);
  if (interpretation) {
    observation.interpretation = [
      {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
        code: interpretation.code,
        display: interpretation.display,
      },
    ];
  }

  return observation;
}

function computeInterpretation(
  parsed: ParsedObservation
): { code: 'L' | 'H' | 'N'; display: string } | null {
  const { numericValue, refLow, refHigh } = parsed;
  if (numericValue === null || refLow === null || refHigh === null) return null;

  if (numericValue < refLow) return { code: 'L', display: 'Low' };
  if (numericValue > refHigh) return { code: 'H', display: 'High' };
  return { code: 'N', display: 'Normal' };
}
