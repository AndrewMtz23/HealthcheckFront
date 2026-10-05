import HeroSection from '@/components/home/HeroSection';
import NewsVerifier from '@/components/home/NewsVerifier';
import NewsFeed from '@/components/news/NewsFeed';
import HomeGuide from '@/components/home/HomeGuide';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <NewsVerifier />
      <HomeGuide />
      <NewsFeed 
        limit={6} 
        showSearch={true}
        title="Últimas noticias verificadas"
        subtitle="Mantente informado con contenido verificado por nuestra plataforma"
      />
    </div>
  );
}
