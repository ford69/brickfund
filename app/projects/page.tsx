'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Users, 
  Search,
  Filter,
  SlidersHorizontal,
  Bell,
  Settings,
  User
} from 'lucide-react';
import { apiClient, Project } from '@/lib/api';

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        const params: any = {};
        if (selectedCategory !== 'all') params.category = selectedCategory;
        if (selectedLocation !== 'all') params.location = selectedLocation;
        // Only include status if explicitly selected (not 'all' or empty)
        if (selectedStatus && selectedStatus !== 'all') {
          params.status = selectedStatus;
        }
        if (searchTerm) params.search = searchTerm;

        console.log('[ProjectsPage] Fetching projects with params:', params);
        const response = await apiClient.getProjects(params);
        
        console.log('[ProjectsPage] API response:', {
          success: response.success,
          hasData: !!response.data,
          dataType: Array.isArray(response.data) ? 'array' : typeof response.data,
          dataLength: Array.isArray(response.data) ? response.data.length : 'N/A',
          fullResponse: response
        });

        if (response.success) {
          // Handle different response structures
          if (Array.isArray(response.data)) {
            console.log('[ProjectsPage] Setting projects array:', response.data.length, 'items');
            setProjects(response.data);
          } else if (response.data && typeof response.data === 'object' && 'projects' in response.data && Array.isArray((response.data as any).projects)) {
            // If data is wrapped in an object with a projects property
            console.log('[ProjectsPage] Setting projects from data.projects:', (response.data as any).projects.length, 'items');
            setProjects((response.data as any).projects);
          } else if (response.data && typeof response.data === 'object' && 'data' in response.data && Array.isArray((response.data as any).data)) {
            // If data is nested
            console.log('[ProjectsPage] Setting projects from data.data:', (response.data as any).data.length, 'items');
            setProjects((response.data as any).data);
          } else {
            console.warn('[ProjectsPage] Unexpected response structure:', response);
            setProjects([]);
          }
        } else {
          console.warn('[ProjectsPage] API response not successful:', response);
          setProjects([]);
          setError(response.message || 'Failed to fetch projects');
        }
      } catch (error: any) {
        console.error('[ProjectsPage] Error fetching projects:', error);
        setError(error.message || 'Failed to fetch projects. Please try again.');
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [selectedCategory, selectedLocation, selectedStatus, searchTerm]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressPercentage = (raised: number, target: number) => {
    return Math.min(Math.round((raised / target) * 100), 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500 hover:bg-green-600';
      case 'funded':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'pending':
        return 'bg-yellow-500 hover:bg-yellow-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <Building2 className="h-8 w-8 text-blue-700" />
            <span className="ml-2 text-2xl font-bold text-gray-900">BrickFund</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/notifications">
              <Button variant="ghost" size="icon" title="Notifications">
                <Bell className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="icon" title="Settings">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="icon" title="Profile">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/list-project">
              <Button className="bg-blue-700 hover:bg-blue-800 text-white">
                List Project
              </Button>
            </Link>
          </div>
        </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Investment Opportunities</h1>
          <p className="text-lg text-gray-600">
            Discover verified real estate projects and start building your portfolio today.
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="sustainable">Sustainable</SelectItem>
                  <SelectItem value="heritage">Heritage</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="TX">Texas</SelectItem>
                  <SelectItem value="FL">Florida</SelectItem>
                  <SelectItem value="CO">Colorado</SelectItem>
                  <SelectItem value="OR">Oregon</SelectItem>
                  <SelectItem value="MA">Massachusetts</SelectItem>
                  <SelectItem value="CA">California</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="funded">Funded</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedLocation('all');
                  setSelectedStatus('all');
                }}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Results Summary */}
        {!isLoading && !error && (
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {projects.length} project{projects.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Projects Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
            <Card key={project._id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
              <div className="relative">
                <img 
                  src={project.images?.[0] || '/images/building-and-contruction-1.jpg'} 
                  alt={project.title}
                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <Badge className={`${getStatusColor(project.status)} text-white`}>
                    {project.status}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary">
                    {project.category}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {project.title}
                </h3>
                
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">
                    {project.location?.city || 'N/A'}, {project.location?.state || 'N/A'}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  {typeof project.developer === 'object' && (project.developer as any)?.companyName
                    ? (project.developer as any).companyName
                    : 'Developer'}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold">
                      {getProgressPercentage(project.raisedAmount || 0, project.targetAmount || 1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${getProgressPercentage(project.raisedAmount || 0, project.targetAmount || 1)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {formatCurrency(project.raisedAmount || 0)} raised
                    </span>
                    <span className="text-gray-600">
                      of {formatCurrency(project.targetAmount || 0)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-sm font-semibold text-gray-900">{project.roi || 0}%</div>
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
              </CardContent>
            </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or browse all available projects.
            </p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedLocation('all');
                setSelectedStatus('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}