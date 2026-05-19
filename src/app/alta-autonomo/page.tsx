import type { Metadata } from 'next';
import AutonomoFormWizard from '@/components/autonomo/AutonomoFormWizard';
import styles from './autonomo.module.css';

export const metadata: Metadata = {
  title: 'Alta de Autónomo | EcomSolutions',
  description: 'Rellena el formulario paso a paso para darte de alta como autónomo',
};

export default function AltaAutonomoPage() {
  return (
    <main className={styles.main}>
      <nav className={styles.nav}>
        <div className={styles.navContent}>
          <span className={styles.logo}>EcomSolutions</span>
          <span className={styles.navSeparator}>|</span>
          <span className={styles.navTitle}>Alta de Autónomo</span>
        </div>
      </nav>
      <div className={styles.container}>
        <AutonomoFormWizard />
      </div>
    </main>
  );
}
