import Header from '@/components/Header';
import Hero from '@/components/Hero';
import FeaturedProjects from '@/components/FeaturedProjects';
import HowItWorks from '@/components/HowItWorks';
import Statistics from '@/components/Statistics';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Statistics />
      <FeaturedProjects />
      <HowItWorks />
      <Footer />
    </div>
  );
}