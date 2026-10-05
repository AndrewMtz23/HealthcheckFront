import Link from 'next/link';
import { FiSearch } from 'react-icons/fi';
import HeartChart from './HeartChart';
import { BookOpenCheck, ScanSearch, ShieldCheck } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="relative bg-white dark:bg-slate-900 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white dark:bg-slate-900 sm:pb-16 md:pb-20 lg:max-w-[50%] lg:w-full lg:pb-28 xl:pb-32">
          <svg
            className="hidden lg:block absolute right-0 inset-y-0 h-full w-24 text-white dark:text-slate-900 transform translate-x-1/2"
            fill="currentColor"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>
          <div className="relative pt-6 px-4 sm:px-6 lg:px-8"></div>
          <div className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300"><ShieldCheck size={15} aria-hidden="true" /> Una mirada más clara a la salud</div>
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-slate-100 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                <span className="block xl:inline">Verifica la autenticidad de</span>{' '}
                <span className="block text-blue-600 dark:text-blue-400 xl:inline">noticias sobre salud</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 dark:text-slate-400 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Combate la desinformación con HealthCheck. Nuestra plataforma utiliza inteligencia artificial para identificar noticias falsas sobre temas de salud, ayudándote a tomar decisiones informadas.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <Link
                    href="/login"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                  >
                    Comenzar
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link
                    href="/about"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-900/60 md:py-4 md:text-lg md:px-10"
                  >
                    Más información
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <div className="min-h-[460px] w-full overflow-hidden bg-blue-50 dark:bg-blue-950/50 md:min-h-[500px] lg:w-full lg:h-full relative">
          <div aria-hidden="true" className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(var(--hero-dot) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div aria-hidden="true" className="absolute -right-24 -top-16 h-80 w-80 rounded-full border-[45px] border-blue-100/70 dark:border-blue-900/70" />
          <div aria-hidden="true" className="absolute -bottom-24 left-12 h-64 w-64 rounded-full border border-blue-200/70 dark:border-blue-800/70" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative flex w-full max-w-xl flex-col items-center gap-5 px-6 text-center lg:pl-24">
              <div className="flex w-full items-center justify-start"><div className="inline-flex items-center gap-3 rounded-2xl border border-blue-100 dark:border-blue-900 bg-white dark:bg-slate-900 px-4 py-3 text-left shadow-sm"><span className="rounded-xl bg-teal-50 dark:bg-teal-950/40 p-2 text-teal-700 dark:text-teal-300"><BookOpenCheck size={20} aria-hidden="true" /></span><div><p className="text-xs font-semibold text-gray-900 dark:text-slate-100">El contexto importa</p><p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Lee más allá del titular</p></div></div></div>
              <HeartChart />
              <div className="flex w-full justify-end"><div className="inline-flex items-center gap-3 rounded-2xl border border-blue-100 dark:border-blue-900 bg-white dark:bg-slate-900 px-4 py-3 text-left shadow-sm"><span className="rounded-xl bg-blue-50 dark:bg-blue-950/50 p-2 text-blue-600 dark:text-blue-400"><ScanSearch size={20} aria-hidden="true" /></span><div><p className="text-xs font-semibold text-gray-900 dark:text-slate-100">Una segunda mirada</p><p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Contrasta fuentes y evidencia</p></div></div></div>
              <p className="flex items-center justify-center gap-2 text-sm font-semibold text-blue-800 dark:text-blue-200 sm:text-base"><FiSearch aria-hidden="true" className="h-5 w-5 shrink-0" />Lee. Contrasta. Comparte.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
