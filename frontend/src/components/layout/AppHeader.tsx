import styles from './AppHeader.module.css';

export function AppHeader() {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Lab Report Reader</h1>
      <p className={styles.subtitle}>
        Upload a diagnostic report. Extracted values are shown against their
        reference range so you can verify each one before it's confirmed.
      </p>
    </header>
  );
}
