import type { Metadata } from 'next';
import PrivacyHero from '@/components/privacy/privacyHero';
import PrivacyContent from '@/components/privacy/privacyContent';
import PrivacyCTA from '@/components/privacy/privacyCTA';

export const metadata: Metadata = {
  title: 'Política de privacidad | HealthCheck',
  description: 'Información sobre los datos utilizados en HealthCheck.',
};

export default function PrivacyPage() {
  return (
    <>
      <PrivacyHero />
      <PrivacyContent />
      <PrivacyCTA />
    </>
  );
}
