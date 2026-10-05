import type { Metadata } from 'next';
import ContactHero from '@/components/contact/contactHero';
import ContactContent from '@/components/contact/contactContent';
import ContactCTA from '@/components/contact/contactCTA';

export const metadata: Metadata = {
  title: 'Contacto y ayuda | HealthCheck',
  description: 'Opciones de ayuda y contacto de HealthCheck.',
};

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <ContactContent />
      <ContactCTA />
    </>
  );
}
