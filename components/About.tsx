'use client';

import { motion } from 'framer-motion';
import { Target, Eye, Heart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function About() {
  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description:
        'Democratize real estate investing by making it accessible to everyone. We connect verified developers with everyday investors to fund property projects and share in the returns.',
      gradient: 'from-primary to-primary/80',
    },
    {
      icon: Eye,
      title: 'Transparency',
      description:
        'Every project is vetted, verified, and presented with full financials. No hidden fees, no surprises—just clear projections and honest communication.',
      gradient: 'from-brand-brown-500 to-brand-brown-600',
    },
    {
      icon: Heart,
      title: 'Community First',
      description:
        'We build trust through a community of investors and developers. Your success is our success—we grow together, brick by brick.',
      gradient: 'from-primary to-primary/80',
    },
  ];

  return (
    <section
      id="about"
      className="py-16 sm:py-20 lg:py-24 bg-background relative overflow-hidden scroll-mt-20"
    >
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-brand-brown-500 rounded-full blur-3xl" />
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
            About BrickFund
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
            Democratizing real estate investment through crowdfunding. Building
            wealth, brick by brick, for everyone.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, staggerChildren: 0.15 }}
        >
          {values.map((item, index) => {
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
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link href="/how-it-works">
            <Button
              size="lg"
              className="bg-primary hover:opacity-90 text-primary-foreground rounded-xl"
            >
              Learn How It Works
            </Button>
          </Link>
          <Link href="/projects">
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl border-2"
            >
              Browse Projects
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
