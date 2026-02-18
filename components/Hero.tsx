'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, Shield, Users, Search, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 24, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
  };

  const iconVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 200, damping: 18 },
    },
  };

  return (
    <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/accra-1.jpg')",
          }}
        />
        {/* Dark overlay for contrast and readability */}
        <div className="absolute inset-0 bg-black/55" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/25 via-transparent to-brand-brown-900/15" />
        <div className="absolute top-20 left-10 w-2 h-2 bg-primary/60 rounded-full blur-sm animate-pulse" />
        <div
          className="absolute top-40 right-20 w-3 h-3 bg-brand-brown-400/50 rounded-full blur-sm animate-pulse"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute bottom-40 left-1/4 w-2 h-2 bg-primary/40 rounded-full blur-sm animate-pulse"
          style={{ animationDelay: '2s' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <motion.div
          className="text-center max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-5 sm:mb-6 leading-[1.1] tracking-tight"
            variants={itemVariants}
          >
            Building Wealth,{' '}
            <motion.span
              className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/90 to-brand-brown-300"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              Brick by Brick
            </motion.span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-white mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Democratize real estate investing. Fund verified property projects with as little as
            $100 and earn returns while developers build the future.
          </motion.p>

          {/* Search bar */}
          <motion.div className="max-w-3xl sm:max-w-4xl mx-auto mb-10 sm:mb-12" variants={itemVariants}>
            <div className="bg-card/95 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-2xl p-2 flex flex-col sm:flex-row gap-2 border border-border/50">
              <div className="flex-1 flex items-center gap-3 px-4 py-3 sm:py-3.5">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="Search by location, project type..."
                  className="flex-1 min-w-0 outline-none text-foreground placeholder:text-muted-foreground bg-transparent text-sm sm:text-base"
                />
              </div>
              <div className="hidden sm:block w-px bg-border self-stretch" />
              <div className="flex items-center px-4 py-3 sm:py-3.5">
                <select className="outline-none text-foreground bg-transparent text-sm sm:text-base cursor-pointer">
                  <option>All Types</option>
                  <option>Residential</option>
                  <option>Commercial</option>
                  <option>Mixed-Use</option>
                </select>
              </div>
              <div className="hidden sm:block w-px bg-border self-stretch" />
              <Link href="/projects" className="flex-shrink-0">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-primary hover:opacity-90 text-primary-foreground rounded-xl px-6 h-11 sm:h-12"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Search Projects
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-14 sm:mb-16"
            variants={itemVariants}
          >
            <Link href="/projects">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-primary hover:opacity-90 text-primary-foreground rounded-xl px-8 py-6 text-base font-semibold shadow-lg"
              >
                Start Investing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>

          {/* Feature cards */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl sm:max-w-5xl mx-auto"
            variants={containerVariants}
          >
            {[
              {
                icon: Shield,
                title: 'Secure & Verified',
                subtitle: 'KYC verified projects only',
                className: 'border-primary/30 bg-primary/5',
                iconBg: 'bg-primary/20',
              },
              {
                icon: TrendingUp,
                title: 'High Returns',
                subtitle: '8–15% projected ROI',
                className: 'border-brand-brown-400/30 bg-brand-brown-900/10',
                iconBg: 'bg-brand-brown-500/20',
              },
              {
                icon: Users,
                title: 'Community Driven',
                subtitle: 'Join 50,000+ investors',
                className: 'border-primary/30 bg-primary/5',
                iconBg: 'bg-primary/20',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  className={`flex items-center gap-4 rounded-xl sm:rounded-2xl p-4 sm:p-6 border backdrop-blur-sm hover:bg-white/15 transition-colors ${item.className}`}
                  variants={iconVariants}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}
                  >
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="font-semibold text-white text-base sm:text-lg">{item.title}</p>
                    <p className="text-sm text-white/75 truncate">{item.subtitle}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <motion.div
          className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.div
            className="w-1.5 h-2.5 bg-white/70 rounded-full"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
