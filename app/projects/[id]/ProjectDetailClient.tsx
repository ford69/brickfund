'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Users, 
  DollarSign,
  ArrowLeft,
  Share2,
  Heart,
  Download,
  FileText,
  BarChart3,
  Shield,
  Clock,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient, Project, DocumentFile } from '@/lib/api';

interface ProjectDetailClientProps {
  projectId: string;
}

export default function ProjectDetailClient({ projectId }: ProjectDetailClientProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [isInvesting, setIsInvesting] = useState(false);
  const [projectDocuments, setProjectDocuments] = useState<DocumentFile[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getProject(projectId);
        if (response.success && response.data) {
          setProject(response.data);
          setInvestmentAmount(response.data.minimumInvestment.toString());
          setError('');
        } else {
          setError(response.message || 'Project not found');
        }
      } catch (err) {
        console.error('Failed to load project:', err);
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!projectId) return;
      try {
        setDocumentsLoading(true);
        const response = await apiClient.getDocuments({ projectId });
        if (response.success && response.data) {
          setProjectDocuments(response.data);
        } else {
          setProjectDocuments([]);
        }
      } catch (err) {
        console.error('Failed to load project documents:', err);
      } finally {
        setDocumentsLoading(false);
      }
    };

    fetchDocuments();
  }, [projectId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleInvest = async () => {
    if (!isAuthenticated) {
      router.push('/signin');
      return;
    }

    setIsInvesting(true);
    try {
      await apiClient.createInvestment({
        projectId,
        amount: parseFloat(investmentAmount),
      });
      router.push('/dashboard');
    } catch (err) {
      console.error('Investment failed:', err);
      setError(err instanceof Error ? err.message : 'Investment failed');
    } finally {
      setIsInvesting(false);
    }
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: project?.title,
        text: project?.shortDescription,
        url: window.location.href,
      });
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The project you\'re looking for doesn\'t exist.'}</p>
          <Link href="/projects">
            <Button>Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  const progressPercentage = project.targetAmount
    ? (project.raisedAmount / project.targetAmount) * 100
    : 0;
  const timelineItems =
    (((project as any)?.timeline ||
      (project as any)?.milestones) as Array<{
        phase: string;
        status: string;
        description?: string;
        date?: string;
      }>) || [];
  const timeRemainingLabel =
    project.timeRemaining !== undefined && project.timeRemaining !== null
      ? `${project.timeRemaining} days`
      : (project as any).timeLeft || 'N/A';

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
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/projects">
            <Button variant="ghost" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Image */}
            <Card>
              <div className="relative">
                <img
                  src={project.images?.[0] || '/images/building-and-contruction-1.jpg'}
                  alt={project.title}
                  className="w-full h-64 object-cover rounded-t-lg"
                />
                <div className="absolute top-4 right-4 flex space-x-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleFavorite}
                    className={isFavorited ? 'bg-red-100 text-red-600' : ''}
                  >
                    <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                  </Button>
                  <Button variant="secondary" size="icon" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Project Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{project.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {project.location.city}, {project.location.state}
                      </div>
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 mr-1" />
                        {project.category}
                      </div>
                    </div>
                  </div>
                  <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-6">{project.description}</p>

                {/* Highlights */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Project Highlights</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {project.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 flex-shrink-0"></div>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Developer Info */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-3">Developer Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">{project.developer.firstName} {project.developer.lastName}</p>
                    <p className="text-sm text-gray-600">{project.developer.companyName}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Information Tabs */}
            <Card>
              <Tabs defaultValue="financials" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="financials">Financials</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="financials" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="font-medium">Total Project Cost</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(project.financials.totalProjectCost)}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                        <span className="font-medium">Projected Return</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        {project.financials.projectedReturn}%
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Calendar className="h-5 w-5 text-gray-600 mr-2" />
                      <span className="font-medium">Expected Completion</span>
                    </div>
                    <p className="text-lg">{new Date(project.financials.expectedCompletion).toLocaleDateString()}</p>
                  </div>
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4">
                  {timelineItems.length === 0 ? (
                    <p className="text-sm text-gray-600">Timeline information will be available soon.</p>
                  ) : (
                    <div className="space-y-4">
                      {timelineItems.map((milestone, index) => (
                        <div key={index} className="flex items-start space-x-4">
                          <div
                            className={`w-3 h-3 rounded-full mt-2 ${
                              milestone.status === 'completed'
                                ? 'bg-blue-600'
                                : milestone.status === 'in-progress'
                                ? 'bg-green-500'
                                : 'bg-gray-300'
                            }`}
                          ></div>
                          <div>
                            <h4 className="font-medium">{milestone.phase}</h4>
                            {milestone.description && (
                              <p className="text-sm text-gray-600">{milestone.description}</p>
                            )}
                            {milestone.date && (
                              <p className="text-xs text-gray-500">
                                {new Date(milestone.date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                  {documentsLoading ? (
                    <div className="flex justify-center py-6">
                      <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-700"></div>
                    </div>
                  ) : projectDocuments.length === 0 ? (
                    <p className="text-sm text-gray-600">No documents have been uploaded for this project yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {projectDocuments.map((document) => (
                        <div key={document._id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-gray-600 mr-3" />
                            <div>
                              <p className="font-medium">{document.name}</p>
                              <p className="text-sm text-gray-600">
                                {document.description || document.category}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!document.url}
                            asChild={!!document.url}
                          >
                            {document.url ? (
                              <Link href={document.url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-2" />
                                View
                              </Link>
                            ) : (
                              <span className="flex items-center">
                                <Download className="h-4 w-4 mr-2" />
                                Unavailable
                              </span>
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Investment Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Investment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Funding Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Funding Progress</span>
                    <span className="text-sm text-gray-600">
                      {formatCurrency(project.raisedAmount)} / {formatCurrency(project.targetAmount)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {progressPercentage.toFixed(1)}% funded
                  </p>
                </div>

                {/* Key Metrics */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Minimum Investment</span>
                    <span className="font-medium">{formatCurrency(project.minimumInvestment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Projected ROI</span>
                    <span className="font-medium text-green-600">{project.roi}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Time Left</span>
                    <span className="font-medium">{timeRemainingLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Investors</span>
                    <span className="font-medium">{project.investorCount}</span>
                  </div>
                </div>

                {/* Investment Form */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="investment-amount">Investment Amount (GHS)</Label>
                    <Input
                      id="investment-amount"
                      type="number"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      min={project.minimumInvestment}
                      placeholder={`Minimum: ${formatCurrency(project.minimumInvestment)}`}
                    />
                  </div>

                  <Button
                    onClick={handleInvest}
                    disabled={isInvesting || !investmentAmount || parseFloat(investmentAmount) < project.minimumInvestment}
                    className="w-full"
                  >
                    {isInvesting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Invest Now'
                    )}
                  </Button>

                  {!isAuthenticated && (
                    <p className="text-sm text-gray-600 text-center">
                      <Link href="/signin" className="text-blue-600 hover:underline">
                        Sign in
                      </Link> to invest
                    </p>
                  )}
                </div>

                {/* Risk Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Shield className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Investment Risk</h4>
                      <p className="text-xs text-yellow-700 mt-1">
                        Real estate investments carry risks. Please review all documents and consider your financial situation before investing.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}