export interface MarkerSubmitResponse {
  success: boolean;
  request_id: string;
  request_check_url: string;
}

export interface MarkerPollResponse {
  status: 'processing' | 'complete' | 'failed';
  success?: boolean;
  markdown?: string;
  error?: string;
}

/**
 * Intermediate shape produced by the parsing service, before it gets
 * mapped into a FHIR Observation resource.
 */
export interface ParsedObservation {
  testName: string;
  rawValue: string;
  numericValue: number | null;
  unit: string | null;
  refLow: number | null;
  refHigh: number | null;
}
