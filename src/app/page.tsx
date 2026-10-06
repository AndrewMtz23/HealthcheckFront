import HeroSection from '@/components/home/HeroSection';
import NewsVerifier from '@/components/home/NewsVerifier';
import NewsFeed from '@/components/news/NewsFeed';
import HealthResources from '@/components/home/HealthResources';
import InformedDecisions from '@/components/home/InformedDecisions';
import HomeGuide from '@/components/home/HomeGuide';
import BenefitsCarousel from '@/components/home/BenefitsCarousel';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <HealthResources />
      <NewsVerifier />

      <NewsFeed 
        limit={6} 
        showSearch={true}
        title="Últimas noticias verificadas"
        subtitle="Mantente informado con contenido verificado por nuestra plataforma"
      />
      <BenefitsCarousel />
      <InformedDecisions />
      <HomeGuide />
    </div>
  );
}
