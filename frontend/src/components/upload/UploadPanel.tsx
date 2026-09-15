import { useCallback, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { ExtractionProgress } from './ExtractionProgress';
import styles from './UploadPanel.module.css';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

interface UploadPanelProps {
  onSubmit: (file: File) => void;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
}

export function UploadPanel({ onSubmit, onCancel, isLoading, error }: UploadPanelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptFile = useCallback((candidate: File | undefined) => {
    if (!candidate) return;
    if (!ACCEPTED_TYPES.includes(candidate.type)) {
      setLocalError('Unsupported file type. Use JPEG, PNG, WebP, or PDF.');
      setFile(null);
      return;
    }
    setLocalError(null);
    setFile(candidate);
  }, []);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    acceptFile(event.dataTransfer.files[0]);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    acceptFile(event.target.files?.[0]);
  };

  const handleExtract = () => {
    if (file) onSubmit(file);
  };

  return (
    <section className={styles.panel}>
      <div
        className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ''}`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragActive(true);
        }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click();
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleInputChange}
          className={styles.hiddenInput}
        />
        {file ? (
          <p className={styles.fileName}>{file.name}</p>
        ) : (
          <>
            <p className={styles.dropzoneLabel}>Drop a report here, or click to browse</p>
            <p className={styles.dropzoneHint}>JPEG, PNG, WebP, or PDF</p>
          </>
        )}
      </div>

      {(localError || error) && <p className={styles.errorText}>{localError ?? error}</p>}

      {isLoading ? (
        <ExtractionProgress isActive onCancel={onCancel} />
      ) : (
        <button className={styles.extractButton} onClick={handleExtract} disabled={!file}>
          Extract observations
        </button>
      )}
    </section>
  );
}