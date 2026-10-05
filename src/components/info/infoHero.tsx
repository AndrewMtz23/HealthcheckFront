import type { IconType } from 'react-icons';
import { FiCheck, FiPlus } from 'react-icons/fi';

interface InfoHeroProps {
  icon: IconType;
  eyebrow: string;
  title: string;
  description: string;
}

export default function InfoHero({ icon: Icon, eyebrow, title, description }: InfoHeroProps) {
  return (
    <header className="border-b border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/50">
      <div className="mx-auto flex max-w-6xl flex-col-reverse gap-8 px-4 py-12 sm:px-6 sm:py-20 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:px-8">
        <div className="min-w-0 flex-1">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-700 dark:text-blue-300">{eyebrow}</p>
        <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-gray-900 dark:text-slate-100 sm:text-5xl">{title}</h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-gray-600 dark:text-slate-300 sm:text-lg">{description}</p>
        </div>
        <div aria-hidden="true" className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm lg:h-52 lg:w-52 lg:rounded-[2rem]">
          <Icon className="h-10 w-10 lg:h-24 lg:w-24" />
          <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-4 border-blue-50 dark:border-blue-950 bg-blue-600 text-white lg:-bottom-4 lg:-right-4 lg:h-14 lg:w-14">
            <FiCheck className="h-4 w-4 lg:h-6 lg:w-6" />
          </span>
          <FiPlus className="absolute -left-5 top-6 hidden h-6 w-6 text-blue-300 lg:block" />
        </div>
      </div>
    </header>
  );
}
