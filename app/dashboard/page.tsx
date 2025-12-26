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
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  MapPin,
  Bell,
  Settings,
  User,
  LogOut
} from 'lucide-react';
import { apiClient, Investment, Project, InvestorDashboardData } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [portfolioStats, setPortfolioStats] = useState({
    totalInvested: 0,
    portfolioValue: 0,
    totalReturns: 0,
    activeInvestments: 0,
    projectedAnnualReturn: 0
  });
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [recentDistributions, setRecentDistributions] = useState<any[]>([]);
  const [recommendedProjects, setRecommendedProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Use unified dashboard endpoint (automatically routes based on user role)
        const dashboardResponse = await apiClient.getDashboard();
        
        if (dashboardResponse.success && dashboardResponse.data) {
          const dashboardData = dashboardResponse.data;
          
          // Check if user is admin or developer and redirect to appropriate dashboard
          if (user?.role === 'admin') {
            router.push('/admin');
            return;
          }
          if (user?.role === 'developer') {
            router.push('/owner-dashboard');
            return;
          }
          
          // Handle investor dashboard data
          if (dashboardData.stats) {
            setPortfolioStats({
              totalInvested: dashboardData.stats.totalInvested || 0,
              portfolioValue: dashboardData.stats.portfolioValue || 0,
              totalReturns: dashboardData.stats.totalReturns || 0,
              activeInvestments: dashboardData.stats.activeInvestments || 0,
              projectedAnnualReturn: dashboardData.stats.projectedAnnualReturn || 0
            });
          }
          
          if (dashboardData.recentInvestments) {
            setInvestments(dashboardData.recentInvestments);
          }
          
          if (dashboardData.recentPayments) {
            setRecentPayments(dashboardData.recentPayments);
          }
          
          if (dashboardData.recentDistributions) {
            setRecentDistributions(dashboardData.recentDistributions);
          }
        } else {
          // Fallback to individual API calls if unified endpoint fails
          const portfolioResponse = await apiClient.getUserPortfolio();
          if (portfolioResponse.success && portfolioResponse.data) {
            setPortfolioStats({
              totalInvested: portfolioResponse.data.totalInvested || 0,
              portfolioValue: portfolioResponse.data.portfolioValue || portfolioResponse.data.totalInvested || 0,
              totalReturns: portfolioResponse.data.totalReturns || 0,
              activeInvestments: portfolioResponse.data.activeInvestments || 0,
              projectedAnnualReturn: portfolioResponse.data.projectedAnnualReturn || 0
            });
          }

          const investmentsResponse = await apiClient.getUserInvestments();
          if (investmentsResponse.success && investmentsResponse.data) {
            setInvestments(investmentsResponse.data);
          }
        }

        // Fetch recommended projects
        const projectsResponse = await apiClient.getFeaturedProjects(3);
        if (projectsResponse.success && projectsResponse.data) {
          setRecommendedProjects(projectsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user, router]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
            <Link href="/profile">
              <Button variant="ghost" size="icon" title="Profile">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Investment Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.firstName || 'User'}! Here's your portfolio overview.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Total Invested</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(portfolioStats.totalInvested)}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Portfolio Value</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(portfolioStats.portfolioValue || portfolioStats.totalInvested)}
                  </p>
                  <div className="flex items-center text-sm text-green-600 mt-1">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    {portfolioStats.totalReturns > 0 ? `+${formatCurrency(portfolioStats.totalReturns)}` : formatCurrency(portfolioStats.totalReturns)}
                  </div>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Active Investments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {portfolioStats.activeInvestments}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Building2 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Projected Annual ROI</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {portfolioStats.projectedAnnualReturn}%
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="investments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="investments">My Investments</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          </TabsList>

          <TabsContent value="investments" className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
                <p className="mt-4 text-gray-600">Loading investments...</p>
              </div>
            ) : investments.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {investments.map((investment) => (
                  <Card key={investment._id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-gray-900">Investment #{investment._id.slice(-6)}</h3>
                        <Badge variant={investment.status === 'active' ? 'default' : 'secondary'}>
                          {investment.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-gray-600">Amount Invested</p>
                          <p className="font-semibold">{formatCurrency(investment.amount)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Current Value</p>
                          <p className="font-semibold text-green-600">
                            {formatCurrency(investment.currentValue)}
                          </p>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Return:</span>
                          <span className="font-semibold text-green-600">
                            {investment.totalReturnPercentage}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-600">Date:</span>
                          <span className="text-sm text-gray-600">
                            {new Date(investment.investmentDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No investments yet</h3>
                <p className="text-gray-600 mb-6">
                  Start building your portfolio by investing in real estate projects.
                </p>
                <Link href="/projects">
                  <Button>Browse Projects</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700"></div>
                    <p className="mt-4 text-gray-600">Loading activity...</p>
                  </div>
                ) : (recentPayments.length > 0 || recentDistributions.length > 0) ? (
                  <div className="space-y-4">
                    {/* Recent Payments */}
                    {recentPayments.map((payment) => (
                      <div key={payment._id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="p-2 rounded-full bg-blue-100">
                          <ArrowDownRight className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Payment of {formatCurrency(payment.amount / 100)} {payment.currency}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(payment.createdAt).toLocaleDateString()} • {payment.status}
                          </p>
                        </div>
                      </div>
                    ))}
                    {/* Recent Distributions */}
                    {recentDistributions.map((distribution) => (
                      <div key={distribution._id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="p-2 rounded-full bg-green-100">
                          <ArrowUpRight className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Distribution of {formatCurrency(distribution.amount / 100)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(distribution.date).toLocaleDateString()} • {distribution.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Investment Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700"></div>
                    <p className="mt-4 text-gray-600">Loading opportunities...</p>
                  </div>
                ) : recommendedProjects.length > 0 ? (
                  <>
                    <p className="text-gray-600 mb-6">
                      Based on your investment history and preferences, here are some opportunities that might interest you.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {recommendedProjects.map((project) => (
                        <Link key={project._id} href={`/projects/${project._id}`}>
                          <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-4">
                              <h4 className="font-semibold text-gray-900 mb-2">{project.title}</h4>
                              <p className="text-sm text-gray-600 mb-2">{project.location.city}, {project.location.state}</p>
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-green-600">{project.roi}% ROI</span>
                                <Badge variant="secondary">{project.category}</Badge>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-6 text-center">
                      <Link href="/projects">
                        <Button variant="outline">Browse All Projects</Button>
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No new opportunities match your criteria at the moment.</p>
                    <Link href="/projects">
                      <Button variant="outline">Browse All Projects</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}