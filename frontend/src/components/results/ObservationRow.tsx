import type { BundleEntry } from '../../types/fhir.types';
import { RangeIndicator } from './RangeIndicator';
import { ReviewFlag } from './ReviewFlag';
import styles from './ObservationTable.module.css';

interface ObservationRowProps {
  entry: BundleEntry;
  needsReview: boolean;
}

export function ObservationRow({ entry, needsReview }: ObservationRowProps) {
  const { code, valueQuantity, referenceRange, interpretation } = entry.resource;

  const range = referenceRange?.[0];
  const low = range?.low?.value ?? null;
  const high = range?.high?.value ?? null;
  const value = Number.isFinite(valueQuantity.value) ? valueQuantity.value : null;
  const interpretationCode = (interpretation?.[0]?.code as 'N' | 'H' | 'L' | undefined) ?? null;

  const loincCode = code.coding[0]?.code;

  return (
    <tr className={needsReview ? styles.reviewRow : undefined}>
      <td className={styles.testCell}>
        <span className={styles.testName}>{code.text}</span>
        {loincCode && <span className={styles.loincCode}>LOINC {loincCode}</span>}
      </td>
      <td className={styles.valueCell}>
        {value !== null ? (
          <>
            {value} <span className={styles.unit}>{valueQuantity.unit}</span>
          </>
        ) : (
          <span className={styles.rawValue}>unreadable</span>
        )}
      </td>
      <td>
        <RangeIndicator value={value} low={low} high={high} flag={interpretationCode} />
      </td>
      <td className={styles.flagCell}>
        <ReviewFlag interpretationCode={interpretationCode} needsReview={needsReview} />
      </td>
    </tr>
  );
}
