import type { Metadata } from 'next';
import RentaFormWizard from '@/components/renta/RentaFormWizard';
import styles from './renta.module.css';

export const metadata: Metadata = {
  title: 'Declaración de la Renta | EcomSolutions',
  description: 'Rellena el formulario paso a paso para que gestionemos tu declaración de la renta (IRPF)',
};

export default function DeclaracionRentaPage() {
  return (
    <main className={styles.main}>
      <nav className={styles.nav}>
        <div className={styles.navContent}>
          <span className={styles.logo}>EcomSolutions</span>
          <span className={styles.navSeparator}>|</span>
          <span className={styles.navTitle}>Declaración de la Renta</span>
        </div>
      </nav>
      <div className={styles.container}>
        <RentaFormWizard />
      </div>
    </main>
  );
}
