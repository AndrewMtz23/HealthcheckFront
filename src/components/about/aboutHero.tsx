import { FiActivity } from 'react-icons/fi';
import InfoHero from '@/components/info/infoHero';

export default function AboutHero() {
  return <InfoHero icon={FiActivity} eyebrow="Acerca de HealthCheck" title="Más contexto. Mejores decisiones." description="Ayudamos a revisar la información sobre salud antes de compartirla. Combinamos el análisis automatizado con el acceso a fuentes para fomentar una lectura crítica." />;
}
