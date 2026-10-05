import { FiSearch, FiFileText, FiBookOpen } from 'react-icons/fi';

const steps = [
  { icon: FiSearch, title: 'Encuentra la información', text: 'Explora noticias de salud o introduce el texto o enlace de una noticia que quieras revisar.' },
  { icon: FiFileText, title: 'Consulta el análisis', text: 'Revisa el resultado y sus indicadores de confianza. Utilízalos como punto de partida para investigar.' },
  { icon: FiBookOpen, title: 'Contrasta antes de compartir', text: 'Lee la fuente original, comprueba su fecha y considera el contexto de la afirmación.' },
];

export default function AboutContent() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">De una duda a una lectura informada</h2>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {steps.map(({ icon: Icon, title, text }, index) => (
          <article key={title} className="min-w-0 rounded-2xl border border-gray-200 bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <Icon aria-hidden="true" className="h-14 w-14 rounded-2xl bg-blue-50 p-3 text-blue-600" />
              <span className="text-sm font-semibold text-gray-400">0{index + 1}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="mt-3 leading-7 text-gray-600">{text}</p>
          </article>
        ))}
      </div>
      <div className="mt-10 border-l-4 border-blue-600 pl-6">
        <h2 className="text-xl font-semibold text-gray-900">La tecnología también tiene límites</h2>
        <p className="mt-3 max-w-3xl leading-8 text-gray-600">Un análisis automatizado puede equivocarse. HealthCheck apoya la revisión de noticias, pero no reemplaza el criterio profesional ni la atención médica. Ante una decisión sobre tu salud, consulta a un profesional.</p>
      </div>
    </section>
  );
}
