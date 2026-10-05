import Link from 'next/link';
import { FiArrowUpRight } from 'react-icons/fi';

interface InfoCTAProps {
  title: string;
  description: string;
  href: string;
  label: string;
}

export default function InfoCTA({ title, description, href, label }: InfoCTAProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 sm:pb-20 lg:px-8">
      <div className="flex flex-col items-start gap-6 rounded-2xl bg-blue-700 p-6 text-white sm:p-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 max-w-2xl">
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="mt-3 leading-7 text-blue-100">{description}</p>
        </div>
        <Link href={href} className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-3 rounded-lg bg-white dark:bg-slate-900 px-5 py-3 text-center font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 sm:w-auto">
          {label}
          <FiArrowUpRight aria-hidden="true" className="h-5 w-5 shrink-0" />
        </Link>
      </div>
    </section>
  );
}
