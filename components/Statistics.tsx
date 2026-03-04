'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiClient } from '@/lib/api';
import { TrendingUp, Building2, Users, DollarSign } from 'lucide-react';

export default function Statistics() {
  const [stats, setStats] = useState({
    totalFunded: 0,
    projectsCompleted: 0,
    activeInvestors: 0,
    averageReturns: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getProjectStats();
        if (response.success && response.data) {
          const data = response.data as {
            totalFunded?: number;
            projectsCompleted?: number;
            activeInvestors?: number;
            averageReturns?: number;
          };
          setStats({
            totalFunded: data.totalFunded ?? 0,
            projectsCompleted: data.projectsCompleted ?? 0,
            activeInvestors: data.activeInvestors ?? 0,
            averageReturns: data.averageReturns ?? 0,
          });
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return 'GH₵0+';
    }
    if (amount >= 1000000) {
      return `GH₵${(amount / 1000000).toFixed(1)}M+`;
    }
    return `GH₵${amount.toLocaleString()}+`;
  };

  const displayStats = [
    {
      value: isLoading ? '...' : formatCurrency(stats.totalFunded),
      label: 'Total Funded',
      icon: DollarSign,
      className: 'text-primary bg-primary/10',
    },
    {
      value: isLoading ? '...' : `${stats.projectsCompleted ?? 0}+`,
      label: 'Projects Completed',
      icon: Building2,
      className: 'text-brand-brown-600 bg-brand-brown-100',
    },
    {
      value: isLoading ? '...' : `${(stats.activeInvestors ?? 0).toLocaleString()}+`,
      label: 'Active Investors',
      icon: Users,
      className: 'text-primary bg-primary/10',
    },
    {
      value: isLoading ? '...' : `${stats.averageReturns ?? 0}%`,
      label: 'Average Returns',
      icon: TrendingUp,
      className: 'text-brand-brown-600 bg-brand-brown-100',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 24, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 100, damping: 14 },
    },
  };

  return (
    <section id="statistics" className="py-16 sm:py-20 lg:py-24 bg-foreground text-background relative overflow-hidden scroll-mt-20">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-brown-500 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-10 sm:mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
            Trusted by Thousands of Investors
          </h2>
          <p className="text-base sm:text-lg text-white/75 max-w-2xl mx-auto">
            Join a growing community building wealth through real estate crowdfunding
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {displayStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={index}
                className="group"
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div className="bg-card/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 text-center border border-white/10 hover:border-white/20 hover:bg-card/15 transition-all duration-300 h-full">
                  <div
                    className={`inline-flex p-3 sm:p-4 rounded-xl mb-3 sm:mb-4 ${stat.className}`}
                  >
                    <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-white/70 font-medium">{stat.label}</div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
