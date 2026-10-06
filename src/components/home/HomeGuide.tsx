import { ArrowUpRight, FileSearch, Layers3, MessageCircleHeart, Sparkles } from 'lucide-react';
import Link from 'next/link';

const steps = [
  { number: '01', title: 'Empieza con una pregunta', description: '¿Ese titular suena demasiado bueno para ser cierto? Detente un momento antes de compartirlo.', icon: MessageCircleHeart, color: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400' },
  { number: '02', title: 'Mira más allá del titular', description: 'Revisa la fuente, la fecha y el contexto. Una noticia completa cuenta más que una frase.', icon: FileSearch, color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300' },
  { number: '03', title: 'Contrasta y decide', description: 'Compara lo que encuentras con otras fuentes y usa el análisis como un punto de partida.', icon: Layers3, color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300' },
];

export default function HomeGuide() {
  return (
    <section className="relative overflow-hidden border-y border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 py-16 sm:py-20" aria-labelledby="guide-title">
      <div aria-hidden="true" className="absolute -right-28 top-0 h-80 w-80 rounded-full border-[40px] border-blue-100/30 dark:border-blue-900/30" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400"><Sparkles size={15} aria-hidden="true" /> Un hábito que hace la diferencia</p>
            <h2 id="guide-title" className="text-3xl font-bold tracking-tight text-gray-900 dark:text-slate-100 sm:text-4xl">Antes de compartir, <span className="text-blue-600 dark:text-blue-400">contrasta.</span></h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">Pequeñas pausas para tomar decisiones mejor informadas.</p>
          </div>
          <Link href="/about" className="inline-flex min-h-11 w-fit items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-200">Conoce HealthCheck <ArrowUpRight size={17} aria-hidden="true" /></Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {steps.map(({ number, title, description, icon: Icon, color }) => (
            <article key={number} className="group rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-900 p-7 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-7 flex items-center justify-between"><span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}><Icon size={23} aria-hidden="true" /></span><span aria-hidden="true" className="text-3xl font-light tracking-tight text-slate-300 dark:text-slate-600">{number}</span></div>
              <h3 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-slate-100">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
