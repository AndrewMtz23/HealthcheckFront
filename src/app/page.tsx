import HeroSection from '@/components/home/HeroSection';
import NewsVerifier from '@/components/home/NewsVerifier';
import NewsFeed from '@/components/news/NewsFeed';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <NewsVerifier />
      <NewsFeed 
        limit={6} 
        showSearch={true}
        title="Últimas noticias verificadas"
        subtitle="Mantente informado con contenido verificado por nuestra plataforma"
      />
    </div>
  );
}