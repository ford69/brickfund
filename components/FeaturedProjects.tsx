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
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <section id="projects" className="py-16 sm:py-20 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-10 sm:mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 tracking-tight">
            Featured Investment Opportunities
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
            Discover verified real estate projects from trusted developers. Start building your
            portfolio with fractional investments.
          </p>
        </motion.div>

        {isLoading ? (
          <motion.div
            className="text-center py-12 sm:py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            <p className="mt-4 text-muted-foreground text-sm">Loading featured projects...</p>
          </motion.div>
        ) : projects.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-10 sm:mb-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            {projects.map((project, index) => (
              <motion.div
                key={project._id}
                variants={cardVariants}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="bg-card rounded-xl sm:rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-300 group"
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
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                    <Badge className="bg-primary text-primary-foreground border-0 shadow-sm">
                      {project.status}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                    <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm border-0">
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
                    <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-6">
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-muted-foreground font-medium">Progress</span>
                      <span className="font-bold text-foreground">
                        {getProgressPercentage(project.raisedAmount, project.targetAmount)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <motion.div
                        className="bg-primary h-2.5 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${getProgressPercentage(project.raisedAmount, project.targetAmount)}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{formatCurrency(project.raisedAmount)} raised</span>
                      <span>of {formatCurrency(project.targetAmount)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6 pb-5 sm:pb-6 border-b border-border">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1.5 sm:mb-2">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        </div>
                      </div>
                      <div className="text-base sm:text-lg font-bold text-foreground">{project.roi}%</div>
                      <div className="text-xs text-muted-foreground">Projected ROI</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1.5 sm:mb-2">
                        <div className="bg-brand-brown-100 p-2 rounded-lg">
                          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-brand-brown-600" />
                        </div>
                      </div>
                      <div className="text-base sm:text-lg font-bold text-foreground">
                        {project.timeRemaining ? `${project.timeRemaining} days` : 'N/A'}
                      </div>
                      <div className="text-xs text-muted-foreground">Time left</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1.5 sm:mb-2">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        </div>
                      </div>
                      <div className="text-base sm:text-lg font-bold text-foreground">{project.investorCount || 0}</div>
                      <div className="text-xs text-muted-foreground">Investors</div>
                    </div>
                  </div>

                  <Link href={`/projects/${project._id}`}>
                    <Button className="w-full bg-primary hover:opacity-90 text-primary-foreground rounded-xl h-11">
                      View Details & Invest
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="text-center py-12 sm:py-16"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Building2 className="h-14 w-14 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No featured projects available</h3>
            <p className="text-muted-foreground mb-6 text-sm sm:text-base">
              Check back soon for new investment opportunities.
            </p>
            <Link href="/projects">
              <Button variant="outline" className="rounded-xl border-border">Browse All Projects</Button>
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
              <Button variant="outline" size="lg" className="rounded-xl border-border hover:bg-accent px-6 sm:px-8">
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