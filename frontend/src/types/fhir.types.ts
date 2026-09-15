export interface Coding {
  system: string;
  code?: string;
  display: string;
}

export interface CodeableConcept {
  coding: Coding[];
  text: string;
}

export interface Quantity {
  value: number;
  unit: string;
  system?: string;
  code?: string;
}

export interface ReferenceRange {
  low?: { value: number; unit: string };
  high?: { value: number; unit: string };
}

export interface Observation {
  resourceType: 'Observation';
  status: 'preliminary';
  code: CodeableConcept;
  valueQuantity: Quantity;
  interpretation?: Coding[];
  referenceRange?: ReferenceRange[];
}

export interface BundleEntry {
  resource: Observation;
}

export interface Bundle {
  resourceType: 'Bundle';
  type: 'collection';
  entry: BundleEntry[];
  meta: {
    source: string;
    needsReview: string[];
  };
}
