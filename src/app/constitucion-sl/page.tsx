import type { Metadata } from 'next';
import FormWizard from '@/components/FormWizard';
import styles from './constitucion.module.css';

export const metadata: Metadata = {
  title: 'Constitución SL | EcomSolutions',
  description: 'Rellena el formulario paso a paso para constituir tu Sociedad Limitada',
};

export default function ConstituccionSLPage() {
  return (
    <main className={styles.main}>
      <nav className={styles.nav}>
        <div className={styles.navContent}>
          <span className={styles.logo}>EcomSolutions</span>
          <span className={styles.navSeparator}>|</span>
          <span className={styles.navTitle}>Formulario de Constitución SL</span>
        </div>
      </nav>
      <div className={styles.container}>
        <FormWizard />
      </div>
    </main>
  );
}
