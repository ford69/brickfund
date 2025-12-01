'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

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
    { value: isLoading ? '...' : formatCurrency(stats.totalFunded), label: 'Total Funded' },
    { value: isLoading ? '...' : `${stats.projectsCompleted ?? 0}+`, label: 'Projects Completed' },
    { value: isLoading ? '...' : `${(stats.activeInvestors ?? 0).toLocaleString()}+`, label: 'Active Investors' },
    { value: isLoading ? '...' : `${stats.averageReturns ?? 0}%`, label: 'Average Returns' },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {displayStats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-blue-700 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}