import type { ParsedObservation } from '../types/ocr.types';

/**
 * Parses OCR'd report text (Marker markdown output) into a list of
 * candidate lab observations. Targets a markdown table shaped like
 * | Test | Result | Reference Range | Unit |, and tolerates:
 * - a method note embedded in the test name cell, e.g.
 *   "Total Cholesterol<br><small>(METHOD: ...)</small>"
 * - a blank unit cell (ratio tests like LDL/HDL RATIO have none)
 * - a descriptive, multi-tier reference range (e.g. HDL's
 *   "Desirable / Borderline / High" tiers) - these are left
 *   unparsed rather than guessing which tier applies.
 */
export function parseObservations(ocrText: string): ParsedObservation[] {
  const results: ParsedObservation[] = [];

  for (const rawLine of ocrText.split('\n')) {
    const line = rawLine.trim();
    if (!line.startsWith('|') || !line.endsWith('|')) continue;

    const cells = line
      .slice(1, -1)
      .split('|')
      .map((cell) => cell.trim());

    if (cells.length < 3 || isSeparatorRow(cells)) continue;

    const [rawName, rawResult, rawRange, rawUnit = ''] = cells;
    const numericValue = parseStrictNumber(rawResult);
    if (numericValue === null) continue; // filters header rows and unrelated tables

    const { low, high } = parseRange(rawRange);

    results.push({
      testName: cleanTestName(rawName),
      rawValue: rawResult,
      numericValue,
      unit: rawUnit.trim() || null,
      refLow: low,
      refHigh: high,
    });
  }

  return results;
}

function isSeparatorRow(cells: string[]): boolean {
  return cells.every((cell) => /^:?-+:?$/.test(cell));
}

/**
 * A cell counts as a result value only if the WHOLE cell is a number
 * (with an optional trailing flag like "*", "H" or "L"). This is what
 * filters out header rows ("RESULT (ENTRY)") and unrelated tables
 * whose cells mix numbers with text ("<200 mg/dL").
 */
function parseStrictNumber(cell: string): number | null {
  const match = /^(\d+\.?\d*)\s*[*HL]?$/.exec(cell);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
}

function parseRange(rawRange: string): { low: number | null; high: number | null } {
  // Descriptive ranges ("Desirable Levels", "Borderline High") mix
  // numbers with words - don't guess which tier is the "real" range.
  if (/[A-Za-z]/.test(rawRange)) return { low: null, high: null };

  const match = /(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/.exec(rawRange);
  if (!match) return { low: null, high: null };

  return { low: toNumber(match[1]), high: toNumber(match[2]) };
}

function cleanTestName(rawName: string): string {
  return rawName
    .split(/<br\s*\/?>/i)[0]
    .replace(/<[^>]+>/g, '')
    .replace(/\*\*/g, '')
    .trim();
}

function toNumber(value: string | undefined): number | null {
  if (value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}