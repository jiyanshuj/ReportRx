import { useEffect, useRef, useState } from 'react';

export const STAGE_LABELS = ['Scanning document', 'Extracting values', 'Structuring results'] as const;

const STAGE_DURATION_MS = 1600;

/**
 * Advances through STAGE_LABELS on a timer while `isActive`. There's no
 * real progress signal from the backend (a single request/response), so
 * this fakes a plausible progression and holds on the last stage until
 * the caller stops passing isActive=true.
 */
export function useExtractionStages(isActive: boolean) {
  const [stageIndex, setStageIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isActive) {
      setStageIndex(0);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setStageIndex((prev) => (prev < STAGE_LABELS.length - 1 ? prev + 1 : prev));
    }, STAGE_DURATION_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  return { stageIndex, stageLabels: STAGE_LABELS };
}
