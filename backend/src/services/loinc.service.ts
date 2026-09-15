interface LoincEntry {
  code: string;
  display: string;
}

// Small static lookup covering common CBC / LFT / KFT panel tests.
// Not exhaustive - intended to be extended as more report types are seen.
const LOINC_MAP: Record<string, LoincEntry> = {
  hemoglobin: { code: '718-7', display: 'Hemoglobin' },
  hb: { code: '718-7', display: 'Hemoglobin' },
  glucose: { code: '2345-7', display: 'Glucose' },
  'fasting glucose': { code: '1558-6', display: 'Glucose, fasting' },
  creatinine: { code: '2160-0', display: 'Creatinine' },
  cholesterol: { code: '2093-3', display: 'Cholesterol, total' },
  'total cholesterol': { code: '2093-3', display: 'Cholesterol, total' },
  hdl: { code: '2085-9', display: 'HDL Cholesterol' },
  ldl: { code: '2089-1', display: 'LDL Cholesterol' },
  triglycerides: { code: '2571-8', display: 'Triglycerides' },
  wbc: { code: '6690-2', display: 'White blood cell count' },
  'white blood cell count': { code: '6690-2', display: 'White blood cell count' },
  rbc: { code: '789-8', display: 'Red blood cell count' },
  'red blood cell count': { code: '789-8', display: 'Red blood cell count' },
  platelets: { code: '777-3', display: 'Platelet count' },
  'platelet count': { code: '777-3', display: 'Platelet count' },
  tsh: { code: '3016-3', display: 'Thyroid stimulating hormone' },
  urea: { code: '3094-0', display: 'Urea nitrogen' },
  'blood urea nitrogen': { code: '3094-0', display: 'Urea nitrogen' },
  sodium: { code: '2951-2', display: 'Sodium' },
  potassium: { code: '2823-3', display: 'Potassium' },
  hba1c: { code: '4548-4', display: 'Hemoglobin A1c' },
};

export function lookupLoinc(testName: string): LoincEntry | null {
  const key = testName.trim().toLowerCase();
  return LOINC_MAP[key] ?? null;
}
