'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  Filter,
  UserPlus,
  UserMinus,
  Edit,
  Trash2,
  BarChart3,
  Activity,
  FileText,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  Unlock,
  LogOut,
  RefreshCw,
  Menu,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard
} from 'lucide-react';
import { apiClient, Project, User } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface AdminStats {
  totalUsers: number;
  totalInvestors: number;
  totalDevelopers: number;
  totalProjects: number;
  pendingProjects: number;
  pendingAccountApprovals: number;
  activeProjects: number;
  totalFundsRaised: number;
  totalInvestments: number;
  recentActivity: any[];
}

interface AccountApproval {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'developer';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  companyName?: string;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalUsers: 0,
    totalInvestors: 0,
    totalDevelopers: 0,
    totalProjects: 0,
    pendingProjects: 0,
    pendingAccountApprovals: 0,
    activeProjects: 0,
    totalFundsRaised: 0,
    totalInvestments: 0,
    recentActivity: []
  });
  
  // Users Management
  const [users, setUsers] = useState<User[]>([]);
  const [investors, setInvestors] = useState<User[]>([]);
  const [developers, setDevelopers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'investor' | 'developer'>('all');
  
  // Projects Management
  const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [projectReviewReason, setProjectReviewReason] = useState('');
  
  // Account Approvals
  const [pendingAccounts, setPendingAccounts] = useState<AccountApproval[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<AccountApproval | null>(null);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [accountReviewReason, setAccountReviewReason] = useState('');
  
  // User Management
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userEditDialogOpen, setUserEditDialogOpen] = useState(false);
  const [userEditData, setUserEditData] = useState<Partial<User>>({});

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchAdminData();
  }, [user, router]);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch dashboard stats
      const statsResponse = await apiClient.getAdminDashboardStats();
      if (statsResponse.success && statsResponse.data) {
        setAdminStats({
          totalUsers: statsResponse.data.totalUsers ?? 0,
          totalInvestors: statsResponse.data.totalInvestors ?? 0,
          totalDevelopers: statsResponse.data.totalDevelopers ?? 0,
          totalProjects: statsResponse.data.totalProjects ?? 0,
          pendingProjects: statsResponse.data.pendingProjects ?? 0,
          pendingAccountApprovals: statsResponse.data.pendingAccountApprovals ?? 0,
          activeProjects: statsResponse.data.activeProjects ?? 0,
          totalFundsRaised: statsResponse.data.totalFundsRaised ?? 0,
          totalInvestments: statsResponse.data.totalInvestments ?? 0,
          recentActivity: statsResponse.data.recentActivity ?? [],
        });
      }

      // Fetch pending projects
      const pendingProjectsResponse = await apiClient.getAdminProjects({ status: 'pending' });
      if (pendingProjectsResponse.success && pendingProjectsResponse.data) {
        setPendingProjects(pendingProjectsResponse.data);
      }

      // Fetch all projects
      const allProjectsResponse = await apiClient.getAdminProjects({});
      if (allProjectsResponse.success && allProjectsResponse.data) {
        setAllProjects(allProjectsResponse.data);
      }

      // Fetch all users
      const usersResponse = await apiClient.getAdminUsers({});
      if (usersResponse.success && usersResponse.data) {
        setUsers(usersResponse.data);
        setInvestors(usersResponse.data.filter((u: User) => u.role === 'user'));
        setDevelopers(usersResponse.data.filter((u: User) => u.role === 'developer'));
      }

      // Fetch pending account approvals
      const pendingAccountsResponse = await apiClient.getPendingAccountApprovals();
      if (pendingAccountsResponse.success && pendingAccountsResponse.data) {
        setPendingAccounts(pendingAccountsResponse.data);
      }

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admin data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleProjectApprove = async (projectId: string) => {
    try {
      const response = await apiClient.approveProject(projectId, projectReviewReason);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Project approved successfully',
        });
        setProjectDialogOpen(false);
        setProjectReviewReason('');
        fetchAdminData();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve project',
        variant: 'destructive',
      });
    }
  };

  const handleProjectReject = async (projectId: string) => {
    if (!projectReviewReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for rejection',
        variant: 'destructive',
      });
      return;
    }
    try {
      const response = await apiClient.rejectProject(projectId, projectReviewReason);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Project rejected',
        });
        setProjectDialogOpen(false);
        setProjectReviewReason('');
        fetchAdminData();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject project',
        variant: 'destructive',
      });
    }
  };

  const handleAccountApprove = async (accountId: string) => {
    try {
      const response = await apiClient.approveAccount(accountId, accountReviewReason);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Account approved successfully',
        });
        setAccountDialogOpen(false);
        setAccountReviewReason('');
        fetchAdminData();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve account',
        variant: 'destructive',
      });
    }
  };

  const handleAccountReject = async (accountId: string) => {
    if (!accountReviewReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for rejection',
        variant: 'destructive',
      });
      return;
    }
    try {
      const response = await apiClient.rejectAccount(accountId, accountReviewReason);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Account rejected',
        });
        setAccountDialogOpen(false);
        setAccountReviewReason('');
        fetchAdminData();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject account',
        variant: 'destructive',
      });
    }
  };

  const handleUserStatusToggle = async (userId: string, isActive: boolean) => {
    try {
      const response = await apiClient.updateUserStatus(userId, isActive);
      if (response.success) {
        toast({
          title: 'Success',
          description: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        });
        fetchAdminData();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user status',
        variant: 'destructive',
      });
    }
  };

  const handleUserEdit = async () => {
    if (!selectedUser) return;
    try {
      const response = await apiClient.updateAdminUser(selectedUser._id, userEditData);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'User updated successfully',
        });
        setUserEditDialogOpen(false);
        setUserEditData({});
        fetchAdminData();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    try {
      const response = await apiClient.deleteUser(userId);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'User deleted successfully',
        });
        fetchAdminData();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const openProjectReview = (project: Project) => {
    setSelectedProject(project);
    setProjectDialogOpen(true);
    setProjectReviewReason('');
  };

  const openAccountReview = (account: AccountApproval) => {
    setSelectedAccount(account);
    setAccountDialogOpen(true);
    setAccountReviewReason('');
  };

  const openUserEdit = (user: User) => {
    setSelectedUser(user);
    setUserEditData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
    });
    setUserEditDialogOpen(true);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = userFilter === 'all' || u.role === userFilter;
    return matchesSearch && matchesFilter;
  });

  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-700 mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'projects', label: 'Projects', icon: Building2 },
    { id: 'approvals', label: 'Approvals', icon: CheckCircle },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
    { id: 'activity', label: 'Activity', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`bg-blue-700 border-r border-blue-800 transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0'
        } fixed h-screen z-40 lg:relative lg:z-auto`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-blue-800">
            {sidebarOpen ? (
              <div className="flex items-center">
                <Shield className="h-6 w-6 text-white" />
                <span className="ml-2 font-bold text-white">Admin Portal</span>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <Shield className="h-6 w-6 text-white" />
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`${sidebarOpen ? 'ml-auto' : 'mx-auto'} text-white hover:bg-blue-600`}
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    // Close sidebar on mobile after selection
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white font-medium'
                      : 'text-blue-100 hover:bg-blue-600 hover:text-white'
                  }`}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${sidebarOpen ? 'mr-3' : 'mx-auto'}`} />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-blue-800">
            <Link href="/">
              <Button
                variant="ghost"
                className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center px-0'} text-blue-100 hover:bg-blue-600 hover:text-white`}
                title={!sidebarOpen ? 'Back to Site' : undefined}
              >
                <Building2 className={`h-5 w-5 flex-shrink-0 ${sidebarOpen ? 'mr-2' : ''}`} />
                {sidebarOpen && <span className="truncate">Back to Site</span>}
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 w-full min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="hidden lg:flex"
                >
                  {sidebarOpen ? (
                    <ChevronLeft className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-600 hidden sm:block">Manage platform operations</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  onClick={fetchAdminData}
                  className="text-gray-700 hover:text-blue-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
                <Link href="/notifications">
                  <Button variant="ghost" size="icon" className="text-gray-700 hover:text-blue-700">
                    <Bell className="h-5 w-5" />
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={logout}
                  className="text-gray-700 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="px-4 sm:px-6 lg:px-8 py-8">

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-2">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{adminStats.totalUsers}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {adminStats.totalInvestors} investors, {adminStats.totalDevelopers} developers
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-2">Total Projects</p>
                  <p className="text-3xl font-bold text-gray-900">{adminStats.totalProjects}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {adminStats.activeProjects} active
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-2">Pending Reviews</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {adminStats.pendingProjects + adminStats.pendingAccountApprovals}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {adminStats.pendingProjects} projects, {adminStats.pendingAccountApprovals} accounts
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-2">Total Funds Raised</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(adminStats.totalFundsRaised)}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {adminStats.totalInvestments} investments
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tabs are now controlled by sidebar, but keep for mobile/fallback */}
          <div className="lg:hidden">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
            </TabsList>
            <TabsList className="grid w-full grid-cols-3 mt-2">
              <TabsTrigger value="approvals">Approvals</TabsTrigger>
              <TabsTrigger value="stats">Stats</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Actions</CardTitle>
                  <CardDescription>
                    Items requiring your attention
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center">
                      <Building2 className="h-5 w-5 text-yellow-600 mr-3" />
                      <div>
                        <p className="text-gray-900 font-semibold">Pending Projects</p>
                        <p className="text-gray-600 text-sm">{adminStats.pendingProjects} projects</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab('projects')}
                    >
                      Review
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center">
                      <UserPlus className="h-5 w-5 text-orange-600 mr-3" />
                      <div>
                        <p className="text-gray-900 font-semibold">Pending Account Approvals</p>
                        <p className="text-gray-600 text-sm">{adminStats.pendingAccountApprovals} accounts</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab('approvals')}
                    >
                      Review
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                  <CardDescription>
                    Platform overview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Active Users</span>
                      <span className="text-gray-900 font-semibold">{adminStats.totalUsers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Active Projects</span>
                      <span className="text-gray-900 font-semibold">{adminStats.activeProjects}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Investments</span>
                      <span className="text-gray-900 font-semibold">{adminStats.totalInvestments}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Funds Raised</span>
                      <span className="text-gray-900 font-semibold">{formatCurrency(adminStats.totalFundsRaised)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>
                      Manage investor and developer accounts
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select value={userFilter} onValueChange={(v: any) => setUserFilter(v)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="user">Investors</SelectItem>
                        <SelectItem value="developer">Developers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>KYC</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell className="font-medium">
                            {user.firstName} {user.lastName}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge className={user.role === 'developer' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                              {user.role === 'developer' ? 'Developer' : 'Investor'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getBadgeColor(user.kycStatus)}>
                              {user.kycStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openUserEdit(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUserStatusToggle(user._id, !user.isActive)}
                                className={user.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                              >
                                {user.isActive ? <Ban className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(user._id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Management</CardTitle>
                <CardDescription>
                  Review and manage property listings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="pending" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="pending">
                      Pending Review ({pendingProjects.length})
                    </TabsTrigger>
                    <TabsTrigger value="all">
                      All Projects ({allProjects.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="pending">
                    {pendingProjects.length > 0 ? (
                      <div className="space-y-4">
                        {pendingProjects.map((project) => (
                          <div key={project._id} className="p-6 bg-white rounded-lg border border-gray-200">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-gray-900 font-semibold text-lg mb-2">{project.title}</h3>
                                <p className="text-gray-600 mb-1">
                                  Developer: {typeof project.developer === 'object' && project.developer?.firstName 
                                    ? `${project.developer.firstName} ${project.developer.lastName}`
                                    : 'Unknown'}
                                </p>
                                <p className="text-gray-500 text-sm">
                                  {project.location.city}, {project.location.state}
                                </p>
                              </div>
                              <Badge className={getBadgeColor(project.status)}>
                                {project.status}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                              <div>
                                <p className="text-gray-600 text-sm mb-1">Funding Goal</p>
                                <p className="text-gray-900 font-semibold">{formatCurrency(project.targetAmount)}</p>
                              </div>
                              <div>
                                <p className="text-gray-600 text-sm mb-1">Submitted</p>
                                <p className="text-gray-900 font-semibold">
                                  {new Date(project.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600 text-sm mb-1">Category</p>
                                <p className="text-gray-900 font-semibold capitalize">{project.category}</p>
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
                                  onClick={() => openProjectReview(project)}
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  Review
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4 opacity-50" />
                        <p className="text-gray-600">No pending projects</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="all">
                    <div className="rounded-lg border border-gray-200 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Developer</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allProjects.map((project) => (
                            <TableRow key={project._id}>
                              <TableCell className="font-medium">{project.title}</TableCell>
                              <TableCell>
                                {typeof project.developer === 'object' && project.developer?.firstName
                                  ? `${project.developer.firstName} ${project.developer.lastName}`
                                  : 'Unknown'}
                              </TableCell>
                              <TableCell>{formatCurrency(project.targetAmount)}</TableCell>
                              <TableCell>
                                <Badge className={getBadgeColor(project.status)}>
                                  {project.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(project.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Link href={`/projects/${project._id}`}>
                                    <Button variant="ghost" size="sm">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openProjectReview(project)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Approvals Tab */}
          <TabsContent value="approvals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Approvals</CardTitle>
                <CardDescription>
                  Review and approve new account registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingAccounts.length > 0 ? (
                  <div className="space-y-4">
                    {pendingAccounts.map((account) => (
                      <div key={account._id} className="p-6 bg-white rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-gray-900 font-semibold text-lg mb-2">
                              {account.firstName} {account.lastName}
                            </h3>
                            <p className="text-gray-600 mb-1">Email: {account.email}</p>
                            <p className="text-gray-500 text-sm">
                              Role: <Badge className={account.role === 'developer' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                                {account.role === 'developer' ? 'Developer' : 'Investor'}
                              </Badge>
                            </p>
                            {account.companyName && (
                              <p className="text-gray-500 text-sm mt-1">
                                Company: {account.companyName}
                              </p>
                            )}
                            <p className="text-gray-500 text-sm mt-1">
                              Registered: {new Date(account.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={getBadgeColor(account.status)}>
                            {account.status}
                          </Badge>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openAccountReview(account)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <UserPlus className="h-16 w-16 text-gray-400 mx-auto mb-4 opacity-50" />
                    <p className="text-gray-600">No pending account approvals</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    User Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-gray-600">Total Users</span>
                      <span className="text-gray-900 font-semibold text-lg">{adminStats.totalUsers}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-gray-600">Investors</span>
                      <span className="text-gray-900 font-semibold text-lg">{adminStats.totalInvestors}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-gray-600">Developers</span>
                      <span className="text-gray-900 font-semibold text-lg">{adminStats.totalDevelopers}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="h-5 w-5 mr-2" />
                    Project Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-gray-600">Total Projects</span>
                      <span className="text-gray-900 font-semibold text-lg">{adminStats.totalProjects}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-gray-600">Active Projects</span>
                      <span className="text-gray-900 font-semibold text-lg">{adminStats.activeProjects}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-gray-600">Pending Review</span>
                      <span className="text-gray-900 font-semibold text-lg">{adminStats.pendingProjects}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Financial Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-gray-600">Total Funds Raised</span>
                      <span className="text-gray-900 font-semibold text-lg">
                        {formatCurrency(adminStats.totalFundsRaised)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-gray-600">Total Investments</span>
                      <span className="text-gray-900 font-semibold text-lg">{adminStats.totalInvestments}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Activity Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-gray-600">Pending Approvals</span>
                      <span className="text-gray-900 font-semibold text-lg">
                        {adminStats.pendingProjects + adminStats.pendingAccountApprovals}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-gray-600">Account Approvals</span>
                      <span className="text-gray-900 font-semibold text-lg">
                        {adminStats.pendingAccountApprovals}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Track platform activities and events
                </CardDescription>
              </CardHeader>
              <CardContent>
                {adminStats.recentActivity && adminStats.recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {adminStats.recentActivity.map((activity: any, index: number) => (
                      <div key={index} className="p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-start">
                          <div className="p-2 bg-blue-100 rounded-full mr-4">
                            <Activity className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-900 font-semibold">{activity.title || 'Activity'}</p>
                            <p className="text-gray-600 text-sm mt-1">
                              {activity.description || activity.message || 'No description'}
                            </p>
                            <p className="text-gray-500 text-xs mt-2">
                              {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Recently'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4 opacity-50" />
                    <p className="text-gray-600">No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Project Review Dialog */}
        <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Project</DialogTitle>
            <DialogDescription>
              {selectedProject?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Review Notes (Optional)</Label>
              <Textarea
                value={projectReviewReason}
                onChange={(e) => setProjectReviewReason(e.target.value)}
                placeholder="Add notes about your decision..."
                className="mt-2"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProjectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedProject && handleProjectReject(selectedProject._id)}
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => selectedProject && handleProjectApprove(selectedProject._id)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Account Review Dialog */}
      <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Account</DialogTitle>
            <DialogDescription>
              {selectedAccount?.firstName} {selectedAccount?.lastName} ({selectedAccount?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Review Notes (Required for rejection)</Label>
              <Textarea
                value={accountReviewReason}
                onChange={(e) => setAccountReviewReason(e.target.value)}
                placeholder="Add notes about your decision..."
                className="mt-2"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAccountDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedAccount && handleAccountReject(selectedAccount._id)}
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => selectedAccount && handleAccountApprove(selectedAccount._id)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Edit Dialog */}
      <Dialog open={userEditDialogOpen} onOpenChange={setUserEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input
                  value={userEditData.firstName || ''}
                  onChange={(e) => setUserEditData({ ...userEditData, firstName: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={userEditData.lastName || ''}
                  onChange={(e) => setUserEditData({ ...userEditData, lastName: e.target.value })}
                  className="mt-2"
                />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={userEditData.email || ''}
                onChange={(e) => setUserEditData({ ...userEditData, email: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={userEditData.phone || ''}
                onChange={(e) => setUserEditData({ ...userEditData, phone: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select
                value={userEditData.role}
                onValueChange={(v: any) => setUserEditData({ ...userEditData, role: v })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Investor</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={userEditData.isActive || false}
                onChange={(e) => setUserEditData({ ...userEditData, isActive: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="isActive">Active Account</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUserEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUserEdit}
              className="bg-blue-700 hover:bg-blue-800 text-white"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
        </Dialog>
        </div>
      </div>
    </div>
  );
}
