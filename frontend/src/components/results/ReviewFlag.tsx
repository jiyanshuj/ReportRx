import styles from './ReviewFlag.module.css';

interface ReviewFlagProps {
  interpretationCode: 'N' | 'H' | 'L' | null;
  needsReview: boolean;
}

const INTERPRETATION_LABEL: Record<'N' | 'H' | 'L', string> = {
  N: 'Normal',
  H: 'High',
  L: 'Low',
};

export function ReviewFlag({ interpretationCode, needsReview }: ReviewFlagProps) {
  if (needsReview) {
    return <span className={`${styles.chip} ${styles.review}`}>Needs review</span>;
  }

  if (!interpretationCode) {
    return <span className={styles.emptyChip}>—</span>;
  }

  const className =
    interpretationCode === 'H'
      ? styles.high
      : interpretationCode === 'L'
        ? styles.low
        : styles.normal;

  return <span className={`${styles.chip} ${className}`}>{INTERPRETATION_LABEL[interpretationCode]}</span>;
}
