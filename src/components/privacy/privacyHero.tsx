import { FiShield } from 'react-icons/fi';
import InfoHero from '@/components/info/infoHero';

export default function PrivacyHero() {
  return <InfoHero icon={FiShield} eyebrow="Tu información" title="Política de privacidad" description="Una explicación del uso de datos en las funciones actuales de HealthCheck, para que sepas qué compartes al utilizar la plataforma." />;
}
