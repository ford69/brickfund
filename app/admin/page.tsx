'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Eye,
  Check,
  X,
  AlertTriangle,
  Settings,
  Bell,
  Search,
  Filter
} from 'lucide-react';
import { apiClient, Project } from '@/lib/api';

export default function AdminDashboard() {
  const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
  const [adminStats, setAdminStats] = useState({
    totalProjects: 0,
    pendingApprovals: 0,
    activeUsers: 0,
    totalFundsRaised: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch dashboard stats
        const statsResponse = await apiClient.getDashboardStats();
        if (statsResponse.success && statsResponse.data) {
          setAdminStats(statsResponse.data);
        }

        // Fetch pending projects
        const projectsResponse = await apiClient.getAllProjects({ status: 'pending' });
        if (projectsResponse.success && projectsResponse.data) {
          setPendingProjects(projectsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
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
            <Badge className="ml-4 bg-purple-100 text-purple-800">Admin</Badge>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost">User Dashboard</Button>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage projects, users, and platform operations.</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {adminStats.totalProjects}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Pending Approvals</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {adminStats.pendingApprovals}
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {adminStats.activeUsers.toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Total Funds Raised</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(adminStats.totalFundsRaised)}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Project Approvals</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700"></div>
                    <p className="mt-4 text-gray-600">Loading projects...</p>
                  </div>
                ) : pendingProjects.length > 0 ? (
                  <div className="space-y-4">
                    {pendingProjects.map((project) => (
                    <div key={project._id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg mb-2">{project.title}</h3>
                          <p className="text-gray-600 mb-1">
                            {typeof project.developer === 'object' && project.developer?.companyName 
                              ? project.developer.companyName 
                              : 'Developer'}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {project.location.city}, {project.location.state}
                          </p>
                        </div>
                        <Badge className={getBadgeColor(project.status)}>
                          {project.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Funding Goal</p>
                          <p className="font-semibold">{formatCurrency(project.targetAmount)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Submitted</p>
                          <p className="font-semibold">{new Date(project.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Risk Level</p>
                          <p className={`font-semibold ${getRiskColor(project.riskAssessment?.level || 'medium')}`}>
                            {project.riskAssessment?.level || 'Medium'}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <Link href={`/projects/${project._id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                        <div className="space-x-2">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => apiClient.updateProjectStatus(project._id, 'active')}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => apiClient.updateProjectStatus(project._id, 'rejected')}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No pending projects</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">User management features coming soon.</p>
                  <p className="text-sm text-gray-400">
                    This will include KYC verification status, user activity, and account management.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Compliance dashboard under development.</p>
                  <p className="text-sm text-gray-400">
                    This will include regulatory compliance monitoring, audit trails, and risk assessments.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Analytics dashboard coming soon.</p>
                  <p className="text-sm text-gray-400">
                    This will include funding trends, user engagement metrics, and performance insights.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}