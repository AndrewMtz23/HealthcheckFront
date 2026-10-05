import type { Metadata } from 'next';
import TermsHero from '@/components/terms/termsHero';
import TermsContent from '@/components/terms/termsContent';
import TermsCTA from '@/components/terms/termsCTA';

export const metadata: Metadata = {
  title: 'Términos y condiciones | HealthCheck',
  description: 'Alcance y pautas de uso de HealthCheck.',
};

export default function TermsPage() {
  return (
    <>
      <TermsHero />
      <TermsContent />
      <TermsCTA />
    </>
  );
}
