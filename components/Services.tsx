'use client';

import { motion } from 'framer-motion';
import { Building2, DollarSign, Shield, BarChart3, Store } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Services() {
  const services = [
    {
      icon: Building2,
      title: 'Real Estate Crowdfunding',
      description:
        'Invest in verified property projects with as little as $100. Access institutional-grade real estate opportunities traditionally reserved for high-net-worth individuals.',
      gradient: 'from-primary to-primary/80',
    },
    {
      icon: DollarSign,
      title: 'Project Listing for Developers',
      description:
        'List your property projects and raise capital from our network of investors. Benefit from secure escrow, transparent reporting, and professional support.',
      gradient: 'from-brand-brown-500 to-brand-brown-600',
    },
    {
      icon: Shield,
      title: 'KYC & Verification',
      description:
        'Secure identity verification and project vetting ensure trust for both investors and developers. All parties are verified before participating.',
      gradient: 'from-primary to-primary/80',
    },
    {
      icon: BarChart3,
      title: 'Investment Management',
      description:
        'Track your portfolio performance, receive distributions, and manage multiple investments from a single dashboard with real-time updates.',
      gradient: 'from-brand-brown-500 to-brand-brown-600',
    },
    {
      icon: Store,
      title: 'Marketplace',
      description:
        'Browse and purchase real estate add-ons, featured placements, and promotional services to boost your project visibility and reach more investors.',
      gradient: 'from-primary to-primary/80',
    },
  ];

  return (
    <section
      id="services"
      className="py-16 sm:py-20 lg:py-24 bg-muted/30 relative overflow-hidden scroll-mt-20"
    >
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-brown-500 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 tracking-tight">
            Our Services
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
            BrickFund provides end-to-end real estate crowdfunding solutions for
            investors and developers alike.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
        >
          {services.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={item.title}
                className="group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <div className="h-full rounded-2xl border border-border bg-card p-6 sm:p-8 hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                  <div
                    className={`inline-flex p-4 rounded-xl mb-4 bg-gradient-to-br ${item.gradient}`}
                  >
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          className="flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link href="/projects">
            <Button size="lg" className="rounded-xl">
              Explore Projects
            </Button>
          </Link>
          <Link href="/marketplace">
            <Button size="lg" variant="outline" className="rounded-xl">
              Browse Marketplace
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
