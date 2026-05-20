import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Constitución SL | EcomSolutions',
  description: 'Formulario paso a paso para constituir tu Sociedad Limitada con EcomSolutions',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
        <footer style={{ textAlign: 'center', padding: '1.5rem 1rem 2rem', fontSize: '12px', color: 'var(--color-muted)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', borderTop: '1px solid var(--color-border)', marginTop: '2rem' }}>
          <a href="https://ecomsolutions.es/politica-de-privacidad/" style={{ color: 'var(--color-muted)' }}>Política de privacidad</a>
          <span style={{ color: 'var(--color-border)' }}>·</span>
          <a href="https://ecomsolutions.es/aviso-legal/" style={{ color: 'var(--color-muted)' }}>Aviso legal</a>
          <span style={{ color: 'var(--color-border)' }}>·</span>
          <a href="https://ecomsolutions.es/politica-de-cookies/" style={{ color: 'var(--color-muted)' }}>Política de cookies</a>
        </footer>
      </body>
    </html>
  );
}
