import { useExtractionStages } from '../../hooks/useExtractionStages';
import { useElapsedSeconds } from '../../hooks/useElapsedSeconds';
import styles from './ExtractionProgress.module.css';

interface ExtractionProgressProps {
  isActive: boolean;
  onCancel: () => void;
}

export function ExtractionProgress({ isActive, onCancel }: ExtractionProgressProps) {
  const { stageIndex, stageLabels } = useExtractionStages(isActive);
  const seconds = useElapsedSeconds(isActive);

  if (!isActive) return null;

  return (
    <div className={styles.wrapper} role="status" aria-live="polite">
      <svg className={styles.scanIcon} width="40" height="50" viewBox="0 0 40 50" aria-hidden="true">
        <rect x="1.5" y="1.5" width="37" height="47" rx="3" fill="var(--color-surface)" stroke="var(--color-line-strong)" />
        <line x1="8" y1="14" x2="32" y2="14" stroke="var(--color-line)" strokeWidth="2" />
        <line x1="8" y1="21" x2="32" y2="21" stroke="var(--color-line)" strokeWidth="2" />
        <line x1="8" y1="28" x2="24" y2="28" stroke="var(--color-line)" strokeWidth="2" />
        <rect x="1.5" y="3" width="37" height="3" className={styles.scanLine} />
      </svg>

      <div className={styles.steps}>
        {stageLabels.map((label, index) => {
          const state = index < stageIndex ? 'done' : index === stageIndex ? 'current' : 'pending';
          return (
            <div key={label} className={styles.step} data-state={state}>
              <span className={styles.dot}>
                {state === 'done' ? (
                  <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden="true">
                    <path
                      d="M2 8.5L6 12.5L14 3.5"
                      stroke="white"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span className={styles.dotInner} />
                )}
              </span>
              <span className={styles.label}>{label}</span>
            </div>
          );
        })}
      </div>

      <div className={styles.footer}>
        <span className={styles.elapsed}>
          {seconds}s elapsed{seconds > 25 ? ' \u00b7 larger reports can take a minute or two' : ''}
        </span>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
