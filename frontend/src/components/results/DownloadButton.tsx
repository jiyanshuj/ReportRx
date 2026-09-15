import type { Bundle } from '../../types/fhir.types';
import styles from './DownloadButton.module.css';

interface DownloadButtonProps {
  bundle: Bundle;
}

export function DownloadButton({ bundle }: DownloadButtonProps) {
  const handleDownload = () => {
    const json = JSON.stringify(bundle, null, 2);
    const blob = new Blob([json], { type: 'application/fhir+json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `fhir-observation-bundle-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <button type="button" className={styles.downloadButton} onClick={handleDownload}>
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M8 1.5v8.5M8 10L4.5 6.5M8 10l3.5-3.5M2 12.5v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1"
          stroke="currentColor"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Download FHIR Bundle
    </button>
  );
}
