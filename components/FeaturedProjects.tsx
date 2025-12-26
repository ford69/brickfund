'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, TrendingUp, Users, Building2, ArrowRight } from 'lucide-react';
import { apiClient, Project } from '@/lib/api';
import Link from 'next/link';

export default function FeaturedProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getFeaturedProjects(6);
        if (response.success && response.data) {
          setProjects(response.data);
        }
      } catch (error) {
        console.error('Error fetching featured projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProjects();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressPercentage = (raised: number, target: number) => {
    return Math.round((raised / target) * 100);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <section id="projects" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Featured Investment Opportunities
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover verified real estate projects from trusted developers. 
            Start building your portfolio with fractional investments.
          </p>
        </motion.div>

        {isLoading ? (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
            <p className="mt-4 text-gray-600">Loading featured projects...</p>
          </motion.div>
        ) : projects.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {projects.map((project, index) => (
              <motion.div
                key={project._id}
                variants={cardVariants}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group border border-gray-100"
              >
                <div className="relative overflow-hidden">
                  <motion.img
                    src={project.images?.[0] || '/images/building-and-contruction-1.jpg'}
                    alt={project.title}
                    className="w-full h-56 object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-green-500 hover:bg-green-600 text-white shadow-lg">
                      {project.status}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                      {project.category}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white drop-shadow-lg">
                      {project.title}
                    </h3>
                    <div className="flex items-center text-white/90 mt-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{project.location.city}, {project.location.state}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-gray-600 font-medium">Progress</span>
                      <span className="font-bold text-gray-900">
                        {getProgressPercentage(project.raisedAmount, project.targetAmount)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-blue-600 to-blue-700 h-3 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${getProgressPercentage(project.raisedAmount, project.targetAmount)}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {formatCurrency(project.raisedAmount)} raised
                      </span>
                      <span className="text-gray-600">
                        of {formatCurrency(project.targetAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-100">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                      <div className="text-lg font-bold text-gray-900">{project.roi}%</div>
                      <div className="text-xs text-gray-600">Projected ROI</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {project.timeRemaining ? `${project.timeRemaining} days` : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-600">Time left</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <div className="bg-purple-100 p-2 rounded-lg">
                          <Users className="h-5 w-5 text-purple-600" />
                        </div>
                      </div>
                      <div className="text-lg font-bold text-gray-900">{project.investorCount || 0}</div>
                      <div className="text-xs text-gray-600">Investors</div>
                    </div>
                  </div>

                  <Link href={`/projects/${project._id}`}>
                    <Button className="w-full bg-blue-700 hover:bg-blue-800 text-white group-hover:shadow-lg transition-all">
                      View Details & Invest
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No featured projects available</h3>
            <p className="text-gray-600 mb-6">
              Check back soon for new investment opportunities.
            </p>
            <Link href="/projects">
              <Button variant="outline">Browse All Projects</Button>
            </Link>
          </motion.div>
        )}

        {projects.length > 0 && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/projects">
              <Button variant="outline" size="lg" className="px-8 py-3 border-2 hover:bg-blue-50">
                View All Projects
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}