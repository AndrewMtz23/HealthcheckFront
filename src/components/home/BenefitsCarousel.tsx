'use client';

import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import styles from './BenefitsCarousel.module.css';

const benefits = [
  {
    title: 'Entiende lo que lees',
    description: 'Analiza afirmaciones de salud con más contexto que un simple titular.',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=85',
    imageAlt: 'Profesional de salud revisando información durante una consulta',
  },
  {
    title: 'Contrasta antes de compartir',
    description: 'Detente un momento, revisa la noticia y busca información que la respalde.',
    image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=900&q=85',
    imageAlt: 'Modelo anatómico de un cerebro que representa temas de salud',
  },
  {
    title: 'Mira más allá del resultado',
    description: 'Usa el análisis como guía y verifica las fuentes por tu cuenta.',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=900&q=85',
    imageAlt: 'Equipo médico conversando en un entorno clínico',
  },
  {
    title: 'Decide con más confianza',
    description: 'La información clara te ayuda a conversar y tomar mejores decisiones.',
    image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=85',
    imageAlt: 'Profesional de salud conversando con una paciente',
  },
];

export default function BenefitsCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(true);

  const updateControls = () => {
    const track = trackRef.current;
    if (!track) return;
    setCanGoBack(track.scrollLeft > 1);
    setCanGoForward(track.scrollLeft + track.clientWidth < track.scrollWidth - 1);
  };

  const move = (direction: -1 | 1) => {
    const track = trackRef.current;
    const slide = track?.querySelector<HTMLElement>(`[data-slide="0"]`);
    if (!track || !slide) return;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({
      left: direction * (slide.offsetWidth + gap),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  };

  return (
    <section className={styles.section} aria-labelledby="benefits-title">
      <div className={styles.container}>
        <header className={styles.heading}>
          <span><CheckCircle2 size={15} aria-hidden="true" /> INFORMACIÓN QUE TE ACOMPAÑA</span>
          <h2 id="benefits-title">Una forma más clara de cuidar lo que compartes</h2>
          <p>Conoce cómo HealthCheck te ayuda a explorar la información de salud.</p>
        </header>

        <div className={styles.carousel} aria-roledescription="carrusel">
          <div
            className={styles.track}
            ref={trackRef}
            onScroll={updateControls}
            role="list"
            aria-label="Beneficios de HealthCheck"
          >
            {benefits.map((benefit, index) => (
              <article
                className={styles.card}
                key={benefit.title}
                data-slide={index}
                role="listitem"
                aria-roledescription="diapositiva"
              >
                <div
                  className={styles.photo}
                  role="img"
                  aria-label={benefit.imageAlt}
                  style={{ backgroundImage: `url("${benefit.image}")` }}
                />
                <div className={styles.overlay} />
                <div className={styles.caption}>
                  <span className={styles.number}>0{index + 1} / 0{benefits.length}</span>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </div>
              </article>
            ))}
          </div>

          <div className={styles.controls}>
            <span className={styles.hint}>Desliza para descubrir</span>
            <div className={styles.buttons}>
              <button
                className={styles.control}
                type="button"
                onClick={() => move(-1)}
                disabled={!canGoBack}
                aria-label="Ver beneficio anterior"
              >
                <ArrowLeft size={19} aria-hidden="true" />
              </button>
              <button
                className={styles.control}
                type="button"
                onClick={() => move(1)}
                disabled={!canGoForward}
                aria-label="Ver siguiente beneficio"
              >
                <ArrowRight size={19} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
