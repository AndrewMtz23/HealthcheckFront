import type { Metadata } from 'next';
import AboutHero from '@/components/about/aboutHero';
import AboutContent from '@/components/about/aboutContent';
import AboutCTA from '@/components/about/aboutCTA';

export const metadata: Metadata = {
  title: 'Acerca de HealthCheck | HealthCheck',
  description: 'Conoce cómo HealthCheck ayuda a revisar noticias sobre salud.',
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutContent />
      <AboutCTA />
    </>
  );
}
