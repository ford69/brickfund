'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  MapPin,
  Calendar,
  TrendingUp,
  DollarSign,
  ArrowLeft,
  BarChart3,
  FileText,
  Loader2,
  Wallet,
  PieChart,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { apiClient, Project, User as UserType, Investment } from '@/lib/api';

interface InvestorProfileClientProps {
  investorId: string;
}

export default function InvestorProfileClient({ investorId }: InvestorProfileClientProps) {
  const [investor, setInvestor] = useState<(UserType & { totalInvested?: number; investmentCount?: number }) | null>(null);
  const [investments, setInvestments] = useState<(Investment & { project?: Project })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError('');

        const profileRes = await apiClient.getInvestorPublicProfile(investorId);
        if (profileRes.success && profileRes.data) {
          setInvestor(profileRes.data);
        }

        const invRes = await apiClient.getInvestorInvestments(investorId, { limit: 50 });
        const list = (invRes.success && Array.isArray(invRes.data) ? invRes.data : []) as (Investment & { project?: Project })[];
        setInvestments(list);

        if (!profileRes.success && list.length === 0) {
          setError('Investor not found or has no public profile.');
        }
      } catch (err) {
        console.error('Failed to load investor profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [investorId]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  const totalInvested = (investor as any)?.totalInvested ?? investments.reduce((sum, i) => sum + (i.amount ?? 0), 0);
  const investmentCount = (investor as any)?.investmentCount ?? investments.length;
  const activeInvestments = investments.filter((i) => i.status === 'active' || i.status === 'confirmed' || i.status === 'pending');
  const completedInvestments = investments.filter((i) => i.status === 'completed');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !investor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/projects">
            <Button>Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  const displayName = investor
    ? [investor.firstName, investor.lastName].filter(Boolean).join(' ') || 'Investor'
    : 'Investor';

  return (
    <div className="min-h-screen bg-background">
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
              <Link href="/owner-dashboard">
                <Button variant="outline">Owner Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/projects">
            <Button variant="ghost" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Basic profile */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <Avatar className="h-24 w-24 rounded-full border-2 border-gray-200">
                    <AvatarImage src={(investor as any)?.avatarUrl} alt={displayName} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-2xl">
                      {displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
                    {(investor as any)?.role === 'investor' && (
                      <Badge variant="secondary" className="mt-2">
                        Investor
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investment overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Investment Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <div className="flex items-center mb-1">
                      <DollarSign className="h-4 w-4 text-emerald-600 mr-2" />
                      <span className="text-sm font-medium text-emerald-800">Total Invested</span>
                    </div>
                    <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalInvested)}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center mb-1">
                      <FileText className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-800">Projects</span>
                    </div>
                    <p className="text-xl font-bold text-blue-600">{investmentCount}</p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <div className="flex items-center mb-1">
                      <PieChart className="h-4 w-4 text-amber-600 mr-2" />
                      <span className="text-sm font-medium text-amber-800">Active</span>
                    </div>
                    <p className="text-xl font-bold text-amber-600">{activeInvestments.length}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center mb-1">
                      <TrendingUp className="h-4 w-4 text-slate-600 mr-2" />
                      <span className="text-sm font-medium text-slate-800">Completed</span>
                    </div>
                    <p className="text-xl font-bold text-slate-600">{completedInvestments.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Projects invested in */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Projects Invested In
                </CardTitle>
              </CardHeader>
              <CardContent>
                {investments.length === 0 ? (
                  <p className="text-sm text-gray-600">No investments to display.</p>
                ) : (
                  <>
                    <ul className="space-y-3">
                      {investments.slice(0, 15).map((inv) => {
                        const project = inv.project;
                        const projectId = typeof inv.projectId === 'string' ? inv.projectId : (inv.projectId as any)?._id ?? (project as any)?._id;
                        const title = (project as any)?.title ?? (project as any)?.name ?? 'Project';
                        const location = project && typeof project === 'object' && (project as any).location
                          ? [(project as any).location?.city, (project as any).location?.state].filter(Boolean).join(', ')
                          : null;
                        return (
                          <li key={inv._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                            <div>
                              <Link href={`/projects/${projectId || '#'}`} className="font-medium text-blue-600 hover:underline">
                                {title}
                              </Link>
                              {location && (
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                                  <MapPin className="h-3 w-3" />
                                  {location}
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {inv.status}
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <div className="text-right text-sm">
                              <p className="font-medium">{formatCurrency(inv.amount ?? 0)}</p>
                              <p className="text-gray-500">
                                {inv.investmentDate
                                  ? new Date(inv.investmentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                                  : '—'}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    {investments.length > 15 && (
                      <p className="text-sm text-gray-500 mt-2">Showing 15 of {investments.length} investments.</p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: Active investments */}
          <div className="space-y-6">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Active Investments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeInvestments.length === 0 ? (
                  <p className="text-sm text-gray-600">No active investments at the moment.</p>
                ) : (
                  activeInvestments.slice(0, 5).map((inv) => {
                    const project = inv.project;
                    const projectId = typeof inv.projectId === 'string' ? inv.projectId : (project as any)?._id;
                    const title = (project as any)?.title ?? (project as any)?.name ?? 'Project';
                    const progress = project && (project as any).targetAmount
                      ? Math.min(100, Math.round(((project as any).raisedAmount ?? 0) / (project as any).targetAmount * 100))
                      : 0;
                    return (
                      <Link key={inv._id} href={`/projects/${projectId || '#'}`} className="block">
                        <div className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                          <p className="font-medium text-gray-900 truncate">{title}</p>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Invested {formatCurrency(inv.amount ?? 0)}</span>
                            {(project as any)?.targetAmount && (
                              <span>Funded {progress}%</span>
                            )}
                          </div>
                          {(project as any)?.targetAmount && (
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                              <div
                                className="bg-emerald-600 h-1.5 rounded-full"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })
                )}
                <Link href="/projects" className="block">
                  <Button variant="outline" className="w-full">Browse all projects</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
