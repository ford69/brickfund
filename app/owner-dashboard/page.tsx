'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  MapPin,
  Bell,
  Settings,
  Plus,
  Eye,
  Edit,
  BarChart3,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { apiClient, OwnerDashboardData, UserSubscription } from '@/lib/api';
import { getFeatureLimits } from '@/lib/subscription-utils';
import SubscriptionStatus from '@/components/SubscriptionStatus';

export default function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalRaised: 0,
    totalInvestors: 0,
    averageROI: 0,
  });
  const [projects, setProjects] = useState<OwnerDashboardData['projects']>([]);
  const [recentInvestors, setRecentInvestors] = useState<OwnerDashboardData['recentInvestors']>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        setError('');
        console.log('[OwnerDashboard] Fetching dashboard data...');
        
        // Fetch subscription status
        const subResponse = await apiClient.getUserSubscription();
        if (subResponse.success && subResponse.data) {
          setSubscription(subResponse.data);
        }
        
        const response = await apiClient.getOwnerDashboard();
        console.log('[OwnerDashboard] API response:', response);
        
        if (response.success && response.data) {
          console.log('[OwnerDashboard] Response data structure:', {
            hasStats: !!response.data.stats,
            hasProjects: !!response.data.projects,
            hasRecentInvestors: !!response.data.recentInvestors,
            dataKeys: Object.keys(response.data)
          });
          
          // Safely set stats with fallback to default values
          if (response.data.stats) {
            setStats({
              totalProjects: response.data.stats.totalProjects ?? 0,
              totalRaised: response.data.stats.totalRaised ?? 0,
              totalInvestors: response.data.stats.totalInvestors ?? 0,
              averageROI: response.data.stats.averageROI ?? 0,
            });
          } else {
            console.warn('[OwnerDashboard] No stats in response, using defaults');
            // Keep default stats (already initialized)
          }
          
          // Safely set projects and investors
          setProjects(response.data.projects || []);
          setRecentInvestors(response.data.recentInvestors || []);
        } else {
          console.warn('[OwnerDashboard] API response not successful or no data:', {
            success: response.success,
            hasData: !!response.data,
            message: response.message,
            error: response.error
          });
          setProjects([]);
          setRecentInvestors([]);
          // Keep default stats (already initialized)
        }
      } catch (err) {
        console.error('[OwnerDashboard] Failed to load owner dashboard:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        // Keep default stats (already initialized) on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const normalized = status?.toLowerCase();
    switch (normalized) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMilestoneStatus = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatProjectLocation = (project: OwnerDashboardData['projects'][number]) => {
    const { city, state, country } = project.location || {};
    return [city, state || country].filter(Boolean).join(', ');
  };

  const getProjectProgress = (project: OwnerDashboardData['projects'][number]) => {
    if (typeof project.progress === 'number') return project.progress;
    if (typeof project.fundingProgress === 'number') return project.fundingProgress;
    if (project.targetAmount) {
      return Math.min(
        100,
        Math.round(((project.raisedAmount || 0) / project.targetAmount) * 100)
      );
    }
    return 0;
  };

  const getInvestorProjectName = (investor: OwnerDashboardData['recentInvestors'][number]) => {
    // Handle case where project might be an object, string, or null/undefined
    if (typeof investor.project === 'string') {
      return investor.project;
    }
    if (investor.project && typeof investor.project === 'object') {
      return (investor.project as any).title || (investor.project as any).name || 'Project';
    }
    return 'Project';
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
              <Badge className="ml-4 bg-purple-100 text-purple-800">Owner</Badge>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost">Investor Dashboard</Button>
              </Link>
              <Link href="/projects">
                <Button variant="ghost">Browse Projects</Button>
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
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Project Owner Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage your real estate projects and track funding progress</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/add-property">
                <Button className="bg-green-700 hover:bg-green-800 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
              </Link>
              <Link href="/list-project">
                <Button className="bg-blue-700 hover:bg-blue-800 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Project
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Subscription Status */}
        <div className="mb-6">
          <SubscriptionStatus subscription={subscription} currentProjectCount={stats.totalProjects} />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? '...' : (stats?.totalProjects ?? 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Raised</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? '...' : formatCurrency(stats?.totalRaised ?? 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Investors</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? '...' : (stats?.totalInvestors ?? 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average ROI</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? '...' : `${stats?.averageROI ?? 0}%`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">My Projects</TabsTrigger>
            <TabsTrigger value="investors">Investors</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Recent Projects */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-6">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-700"></div>
                  </div>
                ) : projects.length === 0 ? (
                  <p className="text-sm text-gray-600">No projects available yet.</p>
                ) : (
                  <div className="space-y-4">
                    {projects.slice(0, 2).map((project) => {
                      const progress = getProjectProgress(project);
                      return (
                        <div key={project._id} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <img
                            src={project.images?.[0] || '/images/building-and-contruction-1.jpg'}
                            alt={project.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{project.title}</h3>
                            <p className="text-sm text-gray-600">{formatProjectLocation(project)}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm text-gray-600">
                                {formatCurrency(project.raisedAmount)} / {formatCurrency(project.targetAmount)}
                              </span>
                              <Badge className={getStatusColor(project.status)}>
                                {project.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{progress}%</p>
                            <p className="text-xs text-gray-600">funded</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Investors */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Investors</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-6">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-700"></div>
                  </div>
                ) : recentInvestors.length === 0 ? (
                  <p className="text-sm text-gray-600">No recent investor activity.</p>
                ) : (
                  <div className="space-y-3">
                    {recentInvestors.map((investor) => (
                      <div key={investor._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{investor.name}</p>
                          <p className="text-sm text-gray-600">{getInvestorProjectName(investor)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatCurrency(investor.amount)}</p>
                          <p className="text-xs text-gray-600">{investor.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-700"></div>
              </div>
            ) : projects.length === 0 ? (
              <p className="text-sm text-gray-600">No projects to display.</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {projects.map((project) => {
                  const progress = getProjectProgress(project);
                  return (
                    <Card key={project._id} className="overflow-hidden">
                      <div className="relative">
                        <img
                          src={project.images?.[0] || '/images/building-and-contruction-1.jpg'}
                          alt={project.title}
                          className="w-full h-48 object-cover"
                        />
                        <Badge className={`absolute top-4 right-4 ${getStatusColor(project.status)}`}>
                          {project.status}
                        </Badge>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.title}</h3>
                        <div className="flex items-center text-sm text-gray-600 mb-3">
                          <MapPin className="h-4 w-4 mr-1" />
                          {formatProjectLocation(project)}
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Raised</p>
                            <p className="font-semibold">{formatCurrency(project.raisedAmount)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Investors</p>
                            <p className="font-semibold">{project.investorCount}</p>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Link href={`/projects/${project._id}`} className="flex-1">
                            <Button variant="outline" className="w-full">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </Link>
                          <Button variant="outline" className="flex-1">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="investors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Investors</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-6">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-700"></div>
                  </div>
                ) : recentInvestors.length === 0 ? (
                  <p className="text-sm text-gray-600">No investor records available.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Investor</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Project</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentInvestors.map((investor) => (
                          <tr key={investor._id} className="border-b">
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                  <Users className="h-4 w-4 text-blue-600" />
                                </div>
                                <span className="font-medium">{investor.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-600">{getInvestorProjectName(investor)}</td>
                            <td className="py-3 px-4 font-medium">{formatCurrency(investor.amount)}</td>
                            <td className="py-3 px-4 text-gray-600">{investor.date}</td>
                            <td className="py-3 px-4">
                              <Badge className={getStatusColor(investor.status)}>
                                {investor.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-6">
                      <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-700"></div>
                    </div>
                  ) : projects.length === 0 ? (
                    <p className="text-sm text-gray-600">No performance data available.</p>
                  ) : (
                    <div className="space-y-4">
                      {projects.map((project) => {
                        const progress = getProjectProgress(project);
                        return (
                          <div key={project._id} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium">{project.title}</h4>
                              <span className="text-sm text-gray-600">{project.roi}% ROI</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>{project.investorCount} investors</span>
                              <span>{progress}% funded</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Project Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-6">
                      <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-700"></div>
                    </div>
                  ) : projects.length === 0 || !projects[0].milestones?.length ? (
                    <p className="text-sm text-gray-600">No timeline data available.</p>
                  ) : (
                    <div className="space-y-4">
                      {projects[0].milestones?.map((milestone, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          {getMilestoneStatus(milestone.status)}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{milestone.phase}</p>
                            <p className="text-xs text-gray-600">{milestone.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}