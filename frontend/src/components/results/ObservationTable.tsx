import type { Bundle } from '../../types/fhir.types';
import { ObservationRow } from './ObservationRow';
import styles from './ObservationTable.module.css';

interface ObservationTableProps {
  bundle: Bundle;
}

export function ObservationTable({ bundle }: ObservationTableProps) {
  const reviewSet = new Set(bundle.meta.needsReview);

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Test</th>
          <th>Value</th>
          <th>Reference range</th>
          <th>Flag</th>
        </tr>
      </thead>
      <tbody>
        {bundle.entry.map((entry, index) => (
          <ObservationRow
            key={`${entry.resource.code.text}-${index}`}
            entry={entry}
            needsReview={reviewSet.has(entry.resource.code.text)}
          />
        ))}
      </tbody>
    </table>
  );
}
