import { FiFileText } from 'react-icons/fi';
import InfoHero from '@/components/info/infoHero';

export default function TermsHero() {
  return <InfoHero icon={FiFileText} eyebrow="Uso de la plataforma" title="Términos y condiciones" description="Conoce el alcance de HealthCheck y las pautas para consultar y compartir información sobre salud de forma responsable." />;
}
