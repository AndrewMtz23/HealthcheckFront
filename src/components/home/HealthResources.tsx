import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ScanSearch } from 'lucide-react';
import styles from './HomeEditorial.module.css';

export default function HealthResources() {
  return <section className={styles.resources} aria-labelledby="resources-title">
    <div className={styles.container}>
      <header className={styles.heading}><span>INFORMACIÓN CON CONTEXTO</span><h2 id="resources-title">Entender tu salud empieza<br/>por informarte mejor.</h2></header>
      <div className={styles.resourceGrid}>
        <div className={styles.intro}><span className={styles.icon}><ScanSearch size={24}/></span><h3>Una segunda mirada antes de compartir</h3><p>Revisa una noticia, contrasta lo que dice y encuentra más contexto. Todo comienza con una pregunta y una fuente que puedas consultar.</p><a className={styles.button} href="#verificador">Verificar información<ArrowUpRight size={16}/></a></div>
        <Link className={styles.tallCard} href="/news"><Image src="/Images/home-health-news.jpg" alt="Profesional de salud atendiendo a una paciente en consulta" fill sizes="(max-width: 767px) 90vw, 360px"/><div className={styles.photoCaption}><span>Explora las noticias</span><span className={styles.arrow}><ArrowUpRight size={19}/></span></div></Link>
        <Link className={styles.wideCard} href="/about"><div className={styles.doctorPhoto}><Image src="/Images/home-health-context.jpg" alt="Profesional de salud conversando con una paciente y sosteniendo una tableta" fill sizes="(max-width: 767px) 90vw, 400px"/></div><div className={styles.cardTitle}><h3>Más contexto para tomar decisiones informadas</h3><span className={styles.arrow}><ArrowUpRight size={19}/></span></div><p>Conoce cómo funciona HealthCheck y qué puedes esperar de un análisis.</p></Link>
      </div>
    </div>
  </section>;
}
