'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  MapPin,
  Download,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { apiClient, Investment, Transaction } from '@/lib/api';

export default function InvestmentHistory() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [investmentsResponse, transactionsResponse] = await Promise.all([
          apiClient.getUserInvestments(),
          apiClient.getUserTransactions(),
        ]);

        if (investmentsResponse.success && investmentsResponse.data) {
          setInvestments(investmentsResponse.data);
        } else {
          setInvestments([]);
        }

        if (transactionsResponse.success && transactionsResponse.data) {
          setTransactions(transactionsResponse.data);
        } else {
          setTransactions([]);
        }
      } catch (err) {
        console.error('Failed to load investment history:', err);
        setError(err instanceof Error ? err.message : 'Failed to load investment data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProjectName = (investment: Investment) =>
    (investment as any).project?.title || (investment as any).projectName || 'Project';

  const getProjectLocation = (investment: Investment) => {
    const project = (investment as any).project;
    if (project?.location) {
      const { city, state, country } = project.location;
      return [city, state || country].filter(Boolean).join(', ');
    }
    return (investment as any).location || '—';
  };

  const getProjectImage = (investment: Investment) =>
    (investment as any).project?.images?.[0] ||
    (investment as any).image ||
    '/images/building-and-contruction-1.jpg';

  const getProjectProgress = (investment: Investment) => {
    const project = (investment as any).project;
    if (typeof (investment as any).progress === 'number') {
      return (investment as any).progress;
    }
    if (project?.fundingProgress) return project.fundingProgress;
    if (project?.targetAmount) {
      return Math.min(
        100,
        Math.round(((project.raisedAmount || 0) / project.targetAmount) * 100)
      );
    }
    return 0;
  };

  const getDistributions = (investment: Investment) =>
    ((investment as any).distributions as Array<{ date: string; amount: number }>) || [];

  const getProjectLink = (investment: Investment) =>
    `/projects/${(investment as any).projectId || (investment as any).project?._id || investment._id}`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'investment':
        return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      case 'distribution':
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-blue-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const normalizedSearch = searchTerm.toLowerCase();

  const filteredInvestments = investments.filter(investment => {
    const projectName = getProjectName(investment).toLowerCase();
    const location = getProjectLocation(investment).toLowerCase();
    return (
      projectName.includes(normalizedSearch) ||
      location.includes(normalizedSearch)
    );
  });

  const filteredTransactions = transactions.filter(transaction =>
    transaction.project.toLowerCase().includes(normalizedSearch) ||
    transaction.reference.toLowerCase().includes(normalizedSearch)
  );

  const totalInvested = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const totalCurrentValue = investments.reduce(
    (sum, inv) => sum + (inv.currentValue ?? inv.amount ?? 0),
    0
  );
  const totalReturns = totalCurrentValue - totalInvested;
  const totalDistributions = transactions
    .filter(t => t.type === 'distribution' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

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
              <Link href="/projects">
                <Button variant="ghost">Browse Projects</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Investment History</h1>
          <p className="text-gray-600 mt-2">Track your investments and view transaction history</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Invested</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? '...' : formatCurrency(totalInvested)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Current Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? '...' : formatCurrency(totalCurrentValue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ArrowUpRight className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Returns</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? '...' : formatCurrency(totalReturns)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Distributions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? '...' : formatCurrency(totalDistributions)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search investments or transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Investments</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-700"></div>
              </div>
            ) : filteredInvestments.length === 0 ? (
              <p className="text-sm text-gray-600">No investments found.</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredInvestments.map((investment) => {
                  const progress = getProjectProgress(investment);
                  const projectName = getProjectName(investment);
                  const location = getProjectLocation(investment);
                  const status = investment.status || 'pending';
                  return (
                    <Card key={investment._id} className="overflow-hidden">
                      <div className="relative">
                        <img
                          src={getProjectImage(investment)}
                          alt={projectName}
                          className="w-full h-48 object-cover"
                        />
                        <Badge className={`absolute top-4 right-4 ${getStatusColor(status)}`}>
                          {status}
                        </Badge>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{projectName}</h3>
                        <div className="flex items-center text-sm text-gray-600 mb-3">
                          <MapPin className="h-4 w-4 mr-1" />
                          {location}
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Invested</span>
                            <span className="font-medium">{formatCurrency(investment.amount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Current Value</span>
                            <span className="font-medium text-green-600">
                              {formatCurrency(investment.currentValue ?? investment.amount)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">ROI</span>
                            <span className="font-medium text-green-600">
                              {investment.totalReturnPercentage}
                            </span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Project Progress</span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Link href={getProjectLink(investment)} className="flex-1">
                            <Button variant="outline" className="w-full">
                              <Eye className="h-4 w-4 mr-2" />
                              View Project
                            </Button>
                          </Link>
                          <Button variant="outline" className="flex-1">
                            <Download className="h-4 w-4 mr-2" />
                            Documents
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-700"></div>
              </div>
            ) : filteredInvestments.filter(inv => (inv.status || '').toLowerCase() === 'active').length === 0 ? (
              <p className="text-sm text-gray-600">You have no active investments.</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredInvestments
                  .filter(inv => (inv.status || '').toLowerCase() === 'active')
                  .map((investment) => {
                    const projectName = getProjectName(investment);
                    const location = getProjectLocation(investment);
                    const status = investment.status || 'active';
                    const distributions = getDistributions(investment);
                    return (
                      <Card key={investment._id} className="overflow-hidden">
                        <div className="relative">
                          <img
                            src={getProjectImage(investment)}
                            alt={projectName}
                            className="w-full h-48 object-cover"
                          />
                          <Badge className={`absolute top-4 right-4 ${getStatusColor(status)}`}>
                            {status}
                          </Badge>
                        </div>
                        <CardContent className="p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{projectName}</h3>
                          <div className="flex items-center text-sm text-gray-600 mb-3">
                            <MapPin className="h-4 w-4 mr-1" />
                            {location}
                          </div>
                          
                          <div className="space-y-3 mb-4">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Invested</span>
                              <span className="font-medium">{formatCurrency(investment.amount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Current Value</span>
                              <span className="font-medium text-green-600">
                                {formatCurrency(investment.currentValue ?? investment.amount)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">ROI</span>
                              <span className="font-medium text-green-600">
                                {investment.totalReturnPercentage}
                              </span>
                            </div>
                          </div>

                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Distributions</h4>
                            <div className="space-y-1">
                              {distributions.slice(0, 2).map((dist, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span className="text-gray-600">{new Date(dist.date).toLocaleDateString()}</span>
                                  <span className="font-medium text-green-600">{formatCurrency(dist.amount)}</span>
                                </div>
                              ))}
                              {!distributions.length && (
                                <p className="text-xs text-gray-500">No distributions recorded yet.</p>
                              )}
                            </div>
                          </div>

                          <div className="flex space-x-2">
                          <Link href={getProjectLink(investment)} className="flex-1">
                              <Button variant="outline" className="w-full">
                                <Eye className="h-4 w-4 mr-2" />
                                View Project
                              </Button>
                            </Link>
                            <Button variant="outline" className="flex-1">
                              <FileText className="h-4 w-4 mr-2" />
                              Reports
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-6">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-700"></div>
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <p className="text-sm text-gray-600">No transactions found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Project</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Reference</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map((transaction) => (
                          <tr key={transaction._id} className="border-b">
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                {getTransactionIcon(transaction.type)}
                                <span className="ml-2 capitalize">{transaction.type}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-900">{transaction.project}</td>
                            <td className="py-3 px-4">
                              <span className={`font-medium ${
                                transaction.type === 'investment' ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {transaction.type === 'investment' ? '-' : '+'}{formatCurrency(transaction.amount)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {new Date(transaction.date).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={getStatusColor(transaction.status)}>
                                {transaction.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-gray-600 font-mono text-sm">
                              {transaction.reference}
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
        </Tabs>
      </div>
    </div>
  );
}