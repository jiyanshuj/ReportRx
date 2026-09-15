import { AppHeader } from './components/layout/AppHeader';
import { UploadPanel } from './components/upload/UploadPanel';
import { ResultsSummary } from './components/results/ResultsSummary';
import { ObservationTable } from './components/results/ObservationTable';
import { DownloadButton } from './components/results/DownloadButton';
import { useExtractReport } from './hooks/useExtractReport';
import styles from './App.module.css';

export function App() {
  const { status, bundle, error, submit, reset, cancel } = useExtractReport();

  return (
    <div className="app-shell">
      <AppHeader />

      <UploadPanel onSubmit={submit} onCancel={cancel} isLoading={status === 'loading'} error={error} />

      {status === 'success' && bundle && (
        <section className={styles.results}>
          <div className={styles.resultsHeader}>
            <ResultsSummary bundle={bundle} />
            <div className={styles.resultsActions}>
              <DownloadButton bundle={bundle} />
              <button className={styles.newUploadButton} onClick={reset}>
                Upload another report
              </button>
            </div>
          </div>
          <ObservationTable bundle={bundle} />
        </section>
      )}
    </div>
  );
}
