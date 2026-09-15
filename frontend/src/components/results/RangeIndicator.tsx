import styles from './RangeIndicator.module.css';

interface RangeIndicatorProps {
  value: number | null;
  low: number | null;
  high: number | null;
  flag: 'N' | 'H' | 'L' | null;
}

const TRACK_WIDTH = 120;
const TRACK_HEIGHT = 20;

export function RangeIndicator({ value, low, high, flag }: RangeIndicatorProps) {
  if (value === null || Number.isNaN(value) || low === null || high === null) {
    return <span className={styles.unavailable}>No reference range</span>;
  }

  // Pad the domain a bit so an out-of-range value still sits inside the track.
  const domainMin = Math.min(low, value) - Math.abs(high - low) * 0.15;
  const domainMax = Math.max(high, value) + Math.abs(high - low) * 0.15;
  const span = domainMax - domainMin || 1;

  const toX = (n: number) => ((n - domainMin) / span) * TRACK_WIDTH;

  const lowX = toX(low);
  const highX = toX(high);
  const valueX = toX(value);

  const dotColor =
    flag === 'H' ? 'var(--color-high)' : flag === 'L' ? 'var(--color-low)' : 'var(--color-normal)';

  return (
    <span className={styles.wrapper}>
      <svg
        width={TRACK_WIDTH}
        height={TRACK_HEIGHT}
        viewBox={`0 0 ${TRACK_WIDTH} ${TRACK_HEIGHT}`}
        role="img"
        aria-label={`Value ${value}, reference range ${low} to ${high}`}
      >
        <line
          x1={0}
          y1={TRACK_HEIGHT / 2}
          x2={TRACK_WIDTH}
          y2={TRACK_HEIGHT / 2}
          stroke="var(--color-line-strong)"
          strokeWidth={1}
        />
        <line
          x1={lowX}
          y1={TRACK_HEIGHT / 2 - 5}
          x2={lowX}
          y2={TRACK_HEIGHT / 2 + 5}
          stroke="var(--color-ink-muted)"
          strokeWidth={1}
        />
        <line
          x1={highX}
          y1={TRACK_HEIGHT / 2 - 5}
          x2={highX}
          y2={TRACK_HEIGHT / 2 + 5}
          stroke="var(--color-ink-muted)"
          strokeWidth={1}
        />
        <line
          x1={lowX}
          y1={TRACK_HEIGHT / 2}
          x2={highX}
          y2={TRACK_HEIGHT / 2}
          stroke="var(--color-normal)"
          strokeWidth={2}
          opacity={0.35}
        />
        <circle cx={valueX} cy={TRACK_HEIGHT / 2} r={3.5} fill={dotColor} />
      </svg>
      <span className={styles.rangeLabel}>
        {low}–{high}
      </span>
    </span>
  );
}
