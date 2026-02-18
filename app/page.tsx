import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Services from '@/components/Services';
import FeaturedProjects from '@/components/FeaturedProjects';
import HowItWorks from '@/components/HowItWorks';
import ContactUs from '@/components/ContactUs';
import Statistics from '@/components/Statistics';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Statistics />
      <About />
      <Services />
      <FeaturedProjects />
      <HowItWorks />
      <ContactUs />
      <Footer />
    </div>
  );
}
