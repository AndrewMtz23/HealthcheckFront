import Image from 'next/image';
import { BookOpenCheck, ScanSearch, ShieldCheck, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import styles from './HomeEditorial.module.css';
const features = [
  {title:'Lee más allá del titular', icon:BookOpenCheck, text:'Revisa la fecha, quién publica y qué evidencia se cita. El contexto ayuda a entender lo que una noticia realmente afirma.'},
  {title:'Usa el análisis como punto de partida', icon:ScanSearch, text:'La inteligencia artificial puede equivocarse. Consulta la explicación y contrasta el resultado con otras fuentes antes de compartirlo.'},
  {title:'Tu bienestar merece fuentes confiables', icon:ShieldCheck, text:'HealthCheck te ayuda a revisar información; no ofrece diagnósticos ni sustituye la atención de un profesional de la salud.'},
];
export default function InformedDecisions() {
  return <section className={styles.care} aria-labelledby="decisions-title"><div className={`${styles.container} ${styles.careGrid}`}>
    <div className={styles.carePhoto}><Image src="/Images/home-informed-care.jpg" alt="Profesional de salud revisando un documento durante una consulta" fill sizes="(max-width: 767px) 90vw, 550px"/><div className={styles.photoNote}><ShieldCheck size={23}/><div><strong>Lee. Contrasta. Comparte.</strong><span>Un hábito que hace la diferencia.</span></div></div></div>
    <div className={styles.careCopy}><span className={styles.eyebrow}>PENSADO PARA TU BIENESTAR</span><h2 id="decisions-title">Más claridad para ti.<br/>Más cuidado al compartir.</h2><p>La información de salud nos afecta a todos. Te acompañamos a revisarla con atención y a reconocer sus límites.</p><div className={styles.accordion}>{features.map(({title,icon:Icon,text},i)=><details key={title} open={i===0}><summary><Icon size={19}/><span>{title}</span><span className={styles.expand} aria-hidden="true">+</span></summary><p>{text}</p></details>)}</div><Link className={styles.textLink} href="/about">Conoce nuestro enfoque<ArrowUpRight size={16}/></Link></div>
  </div></section>;
}
