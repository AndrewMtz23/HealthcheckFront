import type { IconType } from 'react-icons';
import { FiInfo, FiList } from 'react-icons/fi';

export interface InfoSection {
  icon: IconType;
  id: string;
  title: string;
  text: string;
}

export default function InfoSections({ sections, notice }: { sections: InfoSection[]; notice?: string }) {
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14 lg:px-8">
      <nav aria-label="En esta página" className="self-start rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 lg:sticky lg:top-24">
        <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-slate-100"><FiList aria-hidden="true" className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />En esta página</p>
        <ol className="space-y-3">
          {sections.map((section, index) => (
            <li key={section.id}>
              <a className="block py-1 text-sm leading-6 text-gray-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300" href={`#${section.id}`}>
                <span className="mr-2 text-blue-600 dark:text-blue-400">{String(index + 1).padStart(2, '0')}</span>{section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <div className="min-w-0 space-y-8">
        {notice && <div className="flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-5 text-sm leading-7 text-amber-900 dark:text-amber-300"><FiInfo aria-hidden="true" className="mt-1 h-5 w-5 shrink-0" /><p>{notice}</p></div>}
        {sections.map(({ icon: Icon, ...section }) => (
          <section key={section.id} id={section.id} className="scroll-mt-24 border-b border-gray-200 dark:border-slate-700 pb-8 last:border-0">
            <div className="flex items-center gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"><Icon aria-hidden="true" className="h-5 w-5" /></span>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 sm:text-2xl">{section.title}</h2>
            </div>
            <p className="mt-4 leading-8 text-gray-600 dark:text-slate-300">{section.text}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
