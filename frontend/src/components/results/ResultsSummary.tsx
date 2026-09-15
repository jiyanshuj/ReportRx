import type { Bundle } from '../../types/fhir.types';
import styles from './ResultsSummary.module.css';

interface ResultsSummaryProps {
  bundle: Bundle;
}

export function ResultsSummary({ bundle }: ResultsSummaryProps) {
  const total = bundle.entry.length;
  const flagged = bundle.meta.needsReview.length;

  return (
    <div className={styles.summary}>
      <h2 className={styles.heading}>Extracted observations</h2>
      <p className={styles.count}>
        {total} observation{total === 1 ? '' : 's'}
        {flagged > 0 && (
          <>
            {' '}
            · <span className={styles.flaggedCount}>{flagged} need review</span>
          </>
        )}
      </p>
    </div>
  );
}
