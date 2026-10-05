import { FiMessageCircle } from 'react-icons/fi';
import InfoHero from '@/components/info/infoHero';

export default function ContactHero() {
  return <InfoHero icon={FiMessageCircle} eyebrow="Estamos para orientarte" title="Contacto y ayuda" description="Encuentra cómo reportar una fuente, preparar una consulta o comunicar un problema con la plataforma." />;
}
