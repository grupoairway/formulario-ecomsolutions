import type { Metadata } from 'next';
import styles from '../constitucion.module.css';

export const metadata: Metadata = {
  title: 'Solicitud recibida | EcomSolutions',
};

export default function GraciasPage() {
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
        <div className={styles.graciasCard}>
          <div className={styles.graciasIcon}>✅</div>
          <h1 className={styles.graciasTitle}>¡Solicitud recibida!</h1>
          <p className={styles.graciasText}>
            Hemos recibido todos los datos para constituir tu SL. Nos pondremos en contacto
            contigo en menos de 24 horas para confirmar los próximos pasos.
          </p>
          <div className={styles.graciasButtons}>
            <a href="https://ecomsolutions.es" className={styles.btnSecondary}>
              Volver al inicio
            </a>
            <a href="https://wa.me/34661959962" className={styles.btnWhatsapp}>
              💬 Hablar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
