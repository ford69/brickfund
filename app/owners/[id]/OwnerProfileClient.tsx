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
  Users,
  DollarSign,
  ArrowLeft,
  Star,
  Briefcase,
  BarChart3,
  FileText,
  Loader2,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { apiClient, Project, User as UserType } from '@/lib/api';

interface OwnerProfileClientProps {
  ownerId: string;
}

export default function OwnerProfileClient({ ownerId }: OwnerProfileClientProps) {
  const [owner, setOwner] = useState<(UserType & { totalProjects?: number; averageRating?: number; totalRaised?: number }) | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError('');

        const profileRes = await apiClient.getOwnerPublicProfile(ownerId);
        if (profileRes.success && profileRes.data) {
          setOwner(profileRes.data);
        }

        const projectsRes = await apiClient.getProjects({ ownerId, limit: 50 });
        let list: Project[] = [];
        if (projectsRes.success && projectsRes.data) {
          if (Array.isArray(projectsRes.data)) {
            list = projectsRes.data;
          } else if (typeof projectsRes.data === 'object' && 'projects' in (projectsRes.data as any)) {
            list = (projectsRes.data as any).projects || [];
          } else if (typeof projectsRes.data === 'object' && 'data' in (projectsRes.data as any)) {
            list = (projectsRes.data as any).data || [];
          }
        }

        if (list.length === 0) {
          const allRes = await apiClient.getProjects({ limit: 100 });
          if (allRes.success && allRes.data) {
            const raw = Array.isArray(allRes.data)
              ? allRes.data
              : (allRes.data as any)?.projects ?? (allRes.data as any)?.data ?? [];
            list = raw.filter((p: Project) => p.developer?._id === ownerId);
          }
        } else {
          list = list.filter((p: Project) => p.developer?._id === ownerId);
        }

        if (!owner && list.length > 0 && list[0].developer) {
          setOwner(list[0].developer as UserType & { totalProjects?: number; averageRating?: number; totalRaised?: number });
        }

        setProjects(list);

        if (!owner && list.length === 0) {
          setError('Owner not found. They may have no projects yet.');
        }
      } catch (err) {
        console.error('Failed to load owner profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [ownerId]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  const activeProjects = projects.filter((p) => p.status === 'active' || p.status === 'pending');
  const completedProjects = projects.filter((p) => p.status === 'completed' || p.status === 'funded');
  const totalRaised = projects.reduce((sum, p) => sum + (p.raisedAmount ?? 0), 0);
  const totalInvestors = projects.reduce((sum, p) => sum + (p.investorCount ?? 0), 0);
  const avgRoi = projects.length ? projects.reduce((s, p) => s + (p.roi ?? 0), 0) / projects.length : 0;
  const rating = (owner as any)?.averageRating ?? 0;

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

  if (error && !owner) {
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

  const displayName = owner
    ? [owner.firstName, owner.lastName].filter(Boolean).join(' ') || 'Project Owner'
    : 'Project Owner';
  const companyName = (owner as any)?.companyName || '';

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
                    <AvatarImage src={(owner as any)?.avatarUrl} alt={displayName} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl">
                      {displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
                    {companyName && (
                      <p className="text-gray-600 flex items-center gap-1 mt-1">
                        <Briefcase className="h-4 w-4" />
                        {companyName}
                      </p>
                    )}
                    {(owner as any)?.role === 'owner' && (
                      <Badge variant="secondary" className="mt-2">
                        Project Owner
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project success metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Project Success Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center mb-1">
                      <FileText className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-800">Total Projects</span>
                    </div>
                    <p className="text-xl font-bold text-blue-600">{projects.length}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center mb-1">
                      <DollarSign className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800">Total Raised</span>
                    </div>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(totalRaised)}</p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <div className="flex items-center mb-1">
                      <Users className="h-4 w-4 text-amber-600 mr-2" />
                      <span className="text-sm font-medium text-amber-800">Investors</span>
                    </div>
                    <p className="text-xl font-bold text-amber-600">{totalInvestors}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center mb-1">
                      <TrendingUp className="h-4 w-4 text-slate-600 mr-2" />
                      <span className="text-sm font-medium text-slate-800">Avg. ROI</span>
                    </div>
                    <p className="text-xl font-bold text-slate-600">{avgRoi.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investor reviews / ratings placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  Investor Reviews &amp; Ratings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {rating > 0 ? (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`h-6 w-6 ${i <= Math.round(rating) ? 'fill-amber-400 text-amber-500' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="font-medium">{Number(rating).toFixed(1)}</span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No ratings yet. Reviews will appear here once investors leave feedback.</p>
                )}
              </CardContent>
            </Card>

            {/* Project history */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Project History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <p className="text-sm text-gray-600">No projects yet.</p>
                ) : (
                  <>
                    <ul className="space-y-3">
                      {projects.slice(0, 10).map((p) => (
                        <li key={p._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                          <div>
                            <Link href={`/projects/${p._id}`} className="font-medium text-blue-600 hover:underline">
                              {p.title}
                            </Link>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                              <MapPin className="h-3 w-3" />
                              {p.location?.city}, {p.location?.state}
                              <Badge variant="outline" className="text-xs capitalize">
                                {p.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right text-sm">
                            <p className="font-medium">{formatCurrency(p.raisedAmount)} raised</p>
                            <p className="text-gray-500">{p.investorCount} investors</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                    {projects.length > 10 && (
                      <p className="text-sm text-gray-500 mt-2">Showing 10 of {projects.length} projects.</p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: Active projects */}
          <div className="space-y-6">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Active Projects</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeProjects.length === 0 ? (
                  <p className="text-sm text-gray-600">No active projects at the moment.</p>
                ) : (
                  activeProjects.slice(0, 5).map((p) => {
                    const progress = p.targetAmount ? (p.raisedAmount / p.targetAmount) * 100 : 0;
                    return (
                      <Link key={p._id} href={`/projects/${p._id}`} className="block">
                        <div className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                          <p className="font-medium text-gray-900 truncate">{p.title}</p>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>{formatCurrency(p.raisedAmount)} / {formatCurrency(p.targetAmount)}</span>
                            <span>{progress.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
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
