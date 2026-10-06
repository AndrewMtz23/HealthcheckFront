import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown } from 'lucide-react';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  return (
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={styles.backdrop} aria-hidden="true"><span /><span /></div>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h1 id="home-title">Verifica la<br className={styles.desktopBreak} /> autenticidad de <span>noticias sobre salud</span></h1>
          <p>Combate la desinformación con HealthCheck. Nuestra plataforma utiliza inteligencia artificial para identificar noticias falsas sobre temas de salud, ayudándote a tomar decisiones informadas.</p>
          <div className={styles.actions}>
            <Link className={styles.primary} href="/login">Comenzar</Link>
            <Link className={styles.secondary} href="/about">Más información</Link>
          </div>
        </div>
        <div className={styles.visual}>
          <Image src="/Images/doctors.png" alt="Dos profesionales de la salud con bata y estetoscopio" width={1536} height={1536} unoptimized priority sizes="(max-width: 767px) 92vw, (max-width: 1279px) 48vw, 600px" className={styles.doctors} />
        </div>
      </div>
      <a href="#verificador" className={styles.scroll} aria-label="Ir al verificador de información"><ArrowDown size={23} aria-hidden="true" /></a>
    </section>
  );
}
