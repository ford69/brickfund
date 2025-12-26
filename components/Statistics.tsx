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
    averageReturns: 0
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
            averageReturns: data.averageReturns ?? 0
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
      return '$0+';
    }
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M+`;
    }
    return `$${amount.toLocaleString()}+`;
  };

  const displayStats = [
    { 
      value: isLoading ? '...' : formatCurrency(stats.totalFunded), 
      label: 'Total Funded',
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    { 
      value: isLoading ? '...' : `${stats.projectsCompleted ?? 0}+`, 
      label: 'Projects Completed',
      icon: Building2,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    { 
      value: isLoading ? '...' : `${(stats.activeInvestors ?? 0).toLocaleString()}+`, 
      label: 'Active Investors',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    { 
      value: isLoading ? '...' : `${stats.averageReturns ?? 0}%`, 
      label: 'Average Returns',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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
        damping: 12,
      },
    },
  };

  const numberVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 15,
      },
    },
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 via-gray-800 to-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Trusted by Thousands of Investors
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Join a growing community building wealth through real estate crowdfunding
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {displayStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={index}
                className="relative"
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 text-center hover:shadow-2xl transition-shadow duration-300 border border-gray-100">
                  <motion.div
                    className={`inline-flex p-4 rounded-xl ${stat.bgColor} mb-4`}
                    variants={numberVariants}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <IconComponent className={`h-6 w-6 md:h-8 md:w-8 ${stat.color}`} />
                  </motion.div>
                  <motion.div
                    className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2"
                    variants={numberVariants}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-sm md:text-base text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}