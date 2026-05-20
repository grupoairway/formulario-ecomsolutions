'use client';

import styles from '../stepIndicator.module.css';

const STEPS = ['Datos personales', 'Sit. familiar', 'Ingresos', 'Deducciones', 'Otras sit.', 'Documentación', 'Resumen'];

interface Props {
  current: number;
}

export default function RentaStepIndicator({ current }: Props) {
  return (
    <div className={styles.wrapper}>
      {STEPS.map((name, i) => {
        const state = i < current ? 'completed' : i === current ? 'active' : 'pending';
        return (
          <div key={i} className={`${styles.stepItem} ${styles[state] ?? ''}`}>
            <div className={styles.circle}>{state === 'completed' ? '✓' : i + 1}</div>
            <span className={styles.label}>{name}</span>
          </div>
        );
      })}
    </div>
  );
}
