'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, TrendingUp, Users, Building2 } from 'lucide-react';
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

  return (
    <section id="projects" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Featured Investment Opportunities
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover verified real estate projects from trusted developers. 
            Start building your portfolio with fractional investments.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
            <p className="mt-4 text-gray-600">Loading featured projects...</p>
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {projects.map((project) => (
              <div key={project._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className="relative">
                  <img 
                    src={project.images?.[0] || '/images/building-and-contruction-1.jpg'} 
                    alt={project.title}
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-green-500 hover:bg-green-600 text-white">
                      {project.status}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary">
                      {project.category}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {project.title}
                  </h3>
                  
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{project.location.city}, {project.location.state}</span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold">
                        {getProgressPercentage(project.raisedAmount, project.targetAmount)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${getProgressPercentage(project.raisedAmount, project.targetAmount)}%` 
                        }}
                      ></div>
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

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="text-sm font-semibold text-gray-900">{project.roi}%</div>
                      <div className="text-xs text-gray-600">Projected ROI</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {project.timeRemaining ? `${project.timeRemaining} days` : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-600">Time left</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="text-sm font-semibold text-gray-900">{project.investorCount || 0}</div>
                      <div className="text-xs text-gray-600">Investors</div>
                    </div>
                  </div>

                  <Link href={`/projects/${project._id}`}>
                    <Button className="w-full bg-blue-700 hover:bg-blue-800 text-white">
                      View Details & Invest
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No featured projects available</h3>
            <p className="text-gray-600 mb-6">
              Check back soon for new investment opportunities.
            </p>
            <Link href="/projects">
              <Button variant="outline">Browse All Projects</Button>
            </Link>
          </div>
        )}

        {projects.length > 0 && (
          <div className="text-center">
            <Link href="/projects">
              <Button variant="outline" size="lg" className="px-8 py-3">
                View All Projects
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}