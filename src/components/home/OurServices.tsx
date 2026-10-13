import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export default function OurServices() {
  const services = [
    {
      id: 1,
      title: 'Consultas Generales',
      description: 'Encuentra a tu médico ideal con facilidad. Ofrecemos una amplia red de profesionales que se adaptan a tus necesidades y presupuesto.',
      image: 'https://images.unsplash.com/photo-1576091160550-2173ff9e5e3c?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 2,
      title: 'Análisis Clínicos',
      description: 'Resultados precisos y confiables. Te guiamos paso a paso, desde la toma de muestra hasta el diagnóstico final.',
      image: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 3,
      title: 'Atención Especializada',
      description: 'Cuidado médico avanzado y seguimiento continuo con los mejores especialistas de la región.',
      image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=600&q=80',
    }
  ];

  return (
    <section className="py-16 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif text-gray-900 dark:text-white">
              Nuestros Servicios
            </h2>
          </div>
          <div className="flex flex-col items-start lg:pr-12">
            <p className="text-xl text-gray-800 dark:text-slate-200 mb-4 font-medium">
              Brindamos una gama completa de servicios médicos para ayudarte a encontrar, evaluar y cuidar tu salud integral.
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
              Desde búsqueda personalizada de especialistas y consultas guiadas, hasta apoyo en salud preventiva. Nuestro equipo te asegura una experiencia médica fluida y confiable en cada paso.
            </p>
            <Link 
              href="/servicios" 
              className="px-6 py-2.5 bg-[#4A3B32] hover:bg-[#3A2E27] text-white rounded-full text-sm font-medium transition-colors"
            >
              Ver todos
            </Link>
          </div>
        </div>

        {/* Tarjetas de Servicios con Animación Hover */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service) => (
            <div 
              key={service.id}
              className="relative h-[420px] rounded-[2rem] overflow-hidden group transition-transform duration-500 hover:scale-[1.03] shadow-lg cursor-pointer"
            >
              {/* Imagen de fondo */}
              <img 
                src={service.image} 
                alt={service.title} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Gradiente oscuro superior para que el texto sea legible */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/40"></div>
              
              {/* Contenido de la tarjeta */}
              <div className="absolute inset-0 p-8 flex flex-col">
                <h3 className="text-2xl font-serif text-white mb-3">
                  {service.title}
                </h3>
                <p className="text-white/90 text-sm leading-relaxed">
                  {service.description}
                </p>
                
                {/* Botón circular inferior derecho */}
                <div className="mt-auto self-end">
                  <div className="w-12 h-12 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors group-hover:bg-black/90">
                    <ArrowUpRight size={20} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}