export default function BrandWordmark({ light = false }: { light?: boolean }) {
  return <span><span className={light ? 'text-white' : 'text-gray-900 dark:text-slate-100'}>Health</span><span className={light ? 'text-blue-300' : 'text-blue-600 dark:text-blue-400'}>Check</span></span>;
}
