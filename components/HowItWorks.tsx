'use client';

import { motion } from 'framer-motion';
import { Search, DollarSign, TrendingUp, FileCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: 'Discover Projects',
      description: 'Browse verified real estate projects from trusted developers with detailed financials and projections.',
      gradient: 'from-primary to-primary/80',
    },
    {
      icon: FileCheck,
      title: 'Complete Verification',
      description: 'Complete our secure KYC process to ensure compliance and protect all investors on the platform.',
      gradient: 'from-brand-brown-500 to-brand-brown-600',
    },
    {
      icon: DollarSign,
      title: 'Invest Securely',
      description: 'Invest as little as $100 with funds held in escrow until project milestones are achieved.',
      gradient: 'from-primary to-primary/80',
    },
    {
      icon: TrendingUp,
      title: 'Earn Returns',
      description: 'Track your investments and receive returns as projects reach completion and generate revenue.',
      gradient: 'from-brand-brown-500 to-brand-brown-600',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 15,
      },
    },
  };

  return (
    <section id="how-it-works" className="py-16 sm:py-20 lg:py-24 bg-muted/40 relative overflow-hidden scroll-mt-20">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-brand-brown-400 rounded-full blur-3xl" />
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
            How BrickFund Works
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
            Start your real estate investment journey in four simple steps. Our platform makes it
            easy and secure to build wealth through property investments.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12 sm:mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <motion.div
                key={index}
                className="relative text-center group"
                variants={itemVariants}
                whileHover={{ y: -10 }}
              >
                {/* Connection Line (Desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-border to-transparent">
                    <motion.div
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2.5 h-2.5 bg-primary rounded-full"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 + 0.5 }}
                    />
                  </div>
                )}

                <div className="relative mb-6">
                  {/* Step Number */}
                  <motion.div
                    className="absolute -top-2 -left-2 w-8 h-8 bg-foreground rounded-full flex items-center justify-center text-background text-sm font-bold shadow-lg z-10"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2, type: "spring", stiffness: 200 }}
                  >
                    {index + 1}
                  </motion.div>

                  {/* Icon Container */}
                  <motion.div
                    className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-shadow duration-300`}
                    variants={iconVariants}
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <IconComponent className="h-10 w-10 text-white" />
                  </motion.div>
                </div>
                
                <motion.h3
                  className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 + 0.3 }}
                >
                  {step.title}
                </motion.h3>
                
                <motion.p
                  className="text-muted-foreground text-sm sm:text-base leading-relaxed"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 + 0.4 }}
                >
                  {step.description}
                </motion.p>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          className="bg-foreground rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center text-background relative overflow-hidden"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <motion.h3
              className="text-2xl md:text-3xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Ready to Start Building Wealth?
            </motion.h3>
            <motion.p
              className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              Join thousands of investors who are already earning returns through real estate crowdfunding.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link href="/projects">
                  <Button
                    size="lg"
                    className="bg-background text-foreground font-semibold py-5 sm:py-6 px-8 sm:px-10 text-base sm:text-lg hover:bg-background/90 transition-all rounded-xl shadow-lg"
                  >
                    Start Investing Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link href="/how-it-works">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-background/60 !bg-transparent text-background shadow-none font-semibold py-5 sm:py-6 px-8 sm:px-10 text-base sm:text-lg hover:!bg-background hover:text-foreground transition-all rounded-xl"
                  >
                    Learn More
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}