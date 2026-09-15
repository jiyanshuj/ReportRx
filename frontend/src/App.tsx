import { AppHeader } from './components/layout/AppHeader';
import { UploadPanel } from './components/upload/UploadPanel';
import { ResultsSummary } from './components/results/ResultsSummary';
import { ObservationTable } from './components/results/ObservationTable';
import { useExtractReport } from './hooks/useExtractReport';
import styles from './App.module.css';

export function App() {
  const { status, bundle, error, submit, reset } = useExtractReport();

  return (
    <div className="app-shell">
      <AppHeader />

      <UploadPanel onSubmit={submit} isLoading={status === 'loading'} error={error} />

      {status === 'success' && bundle && (
        <section className={styles.results}>
          <div className={styles.resultsHeader}>
            <ResultsSummary bundle={bundle} />
            <button className={styles.newUploadButton} onClick={reset}>
              Upload another report
            </button>
          </div>
          <ObservationTable bundle={bundle} />
        </section>
      )}
    </div>
  );
}
