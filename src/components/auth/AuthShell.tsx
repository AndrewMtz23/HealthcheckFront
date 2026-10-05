import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import styles from './auth.module.css';
import BrandWordmark from '@/components/layout/BrandWordmark';
import ThemeSelector from '@/components/layout/ThemeSelector';

function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={`${styles.brand} ${light ? styles.brandLight : ''}`} aria-label="HealthCheck, ir al inicio">
      <Image src="/Images/logoHC.png" alt="" width={44} height={31} className={styles.brandLogo} />
      <BrandWordmark light={light} />
    </Link>
  );
}

export default function AuthShell({ children, variant }: { children: React.ReactNode; variant: 'login' | 'register' }) {
  return (
    <section className={`${styles.page} ${variant === 'register' ? styles.registerPage : ''}`} aria-label={variant === 'login' ? 'Acceso a HealthCheck' : 'Registro en HealthCheck'}>
      <div className={styles.shell}>
        <aside className={styles.story} aria-label="HealthCheck, información para tu bienestar">
          <Image src="/Images/auth-reading.webp" alt="" fill priority sizes="(max-width: 760px) 1px, (max-width: 1100px) 40vw, 36vw" className={styles.storyPhoto} />
          <div className={styles.photoShade} />
          <Brand light />
          <div className={styles.storyCopy}>
            <p className={styles.storyEyebrow}>TU BIENESTAR EMPIEZA AQUÍ</p>
            <h2>Más claridad.<br />Mejores decisiones.</h2>
            <p>Un espacio para entender lo que lees<br className={styles.desktopBreak} /> y cuidar lo que más importa.</p>
            <span className={styles.storySignature}>Lee. Contrasta. Comparte.</span>
          </div>
        </aside>
        <div className={styles.formPanel}>
          <header className={styles.panelTop}>
            <div className={styles.mobileBrand}><Brand /></div>
            <ThemeSelector />
            <Link href="/" className={styles.back}><ArrowLeft size={15} aria-hidden="true" /><span>Volver al inicio</span></Link>
          </header>
          <div className={styles.formStage}>{children}</div>
          <footer className={styles.legal}>
            <span>© {new Date().getFullYear()} HealthCheck</span>
            <div><Link href="/privacy">Privacidad</Link><Link href="/terms">Términos</Link></div>
          </footer>
        </div>
      </div>
    </section>
  );
}
