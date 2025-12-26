import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Project {
  _id: string;
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  images: string[];
  primaryImage: string | null;
  targetAmount: number;
  raisedAmount: number;
  remainingAmount: number;
  fundingProgress: number;
  minimumInvestment: number;
  maximumInvestment?: number;
  roi: number;
  investmentTerm: number;
  distributionSchedule: string;
  status: string;
  investorCount: number;
  totalInvested: number;
  daysRemaining: number | null;
  canInvest: boolean;
  developer: {
    _id: string;
    firstName: string;
    lastName: string;
    companyName?: string;
    averageRating?: number;
    totalProjects?: number;
  };
  highlights: string[];
  financials: {
    totalProjectCost: number;
    projectedReturn: number;
    expectedCompletion: string;
    constructionStart?: string;
    constructionEnd?: string;
  };
  timeline: Array<{
    phase: string;
    status: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  riskAssessment: {
    level: string;
    factors: string[];
    mitigation: string[];
  };
  tags: string[];
  investors: Array<{
    userId: {
      firstName: string;
      lastName: string;
    };
    amount: number;
    investedAt: string;
    status: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface ProjectResponse {
  success: boolean;
  data: Project;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [investmentAmount, setInvestmentAmount] = useState<number>(0);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProject(id);
    }
  }, [id]);

  const fetchProject = async (projectId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Get auth token if available
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Project not found');
        }
        throw new Error('Failed to fetch project');
      }

      const data: ProjectResponse = await response.json();
      
      if (data.success) {
        setProject(data.data);
        setInvestmentAmount(data.data.minimumInvestment);
      } else {
        throw new Error('Failed to load project');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching project');
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvest = async () => {
    if (!project || !investmentAmount) return;

    // Validate investment amount
    if (investmentAmount < project.minimumInvestment) {
      alert(`Minimum investment is ${formatCurrency(project.minimumInvestment)}`);
      return;
    }

    if (project.maximumInvestment && investmentAmount > project.maximumInvestment) {
      alert(`Maximum investment is ${formatCurrency(project.maximumInvestment)}`);
      return;
    }

    if (investmentAmount > project.remainingAmount) {
      alert(`Maximum available investment is ${formatCurrency(project.remainingAmount)}`);
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { from: `/projects/${project._id}` } });
      return;
    }

    try {
      setProcessingPayment(true);
      
      // Initialize payment with Paystack
      // Note: Paystack uses a REDIRECT flow (not popup)
      // User will be redirected to Paystack checkout, then back to /payment/success or /payment/failed
      const response = await fetch(`${API_BASE_URL}/payments/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId: project._id,
          amount: investmentAmount,
          currency: 'GHS', // Change to match your Paystack account currency (GHS, NGN, USD, etc.)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initialize payment');
      }

      const data = await response.json();
      
      if (data.success && data.data.authorizationUrl) {
        // Redirect user to Paystack checkout page
        // After payment, Paystack will redirect to backend callback,
        // which then redirects to frontend success/failure page
        window.location.href = data.data.authorizationUrl;
      } else {
        throw new Error('Payment initialization failed');
      }
    } catch (err: any) {
      setProcessingPayment(false);
      alert(`Error: ${err.message}`);
      console.error('Error initializing payment:', err);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Project not found'}</p>
          <button
            onClick={() => navigate('/projects')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/projects')}
            className="text-blue-600 hover:text-blue-800 flex items-center mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Projects
          </button>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              project.status === 'active' ? 'bg-green-100 text-green-800' :
              project.status === 'funded' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {project.status.toUpperCase()}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
              {project.category}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            {project.images && project.images.length > 0 && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-96 bg-gray-200">
                  <img
                    src={project.images[selectedImageIndex]}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {project.images.length > 1 && (
                  <div className="p-4 grid grid-cols-4 gap-2">
                    {project.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative h-20 rounded overflow-hidden border-2 ${
                          selectedImageIndex === index ? 'border-blue-600' : 'border-transparent'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${project.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Project Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Project</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            </div>

            {/* Highlights */}
            {project.highlights && project.highlights.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Highlights</h2>
                <ul className="space-y-2">
                  {project.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Financial Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Financial Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Project Cost</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(project.financials.totalProjectCost)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Projected Return</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(project.financials.projectedReturn)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expected Completion</p>
                  <p className="text-lg font-semibold text-gray-900">{formatDate(project.financials.expectedCompletion)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Distribution Schedule</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">{project.distributionSchedule.replace('_', ' ')}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            {project.timeline && project.timeline.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Timeline</h2>
                <div className="space-y-4">
                  {project.timeline.map((phase, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">{phase.phase}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          phase.status === 'completed' ? 'bg-green-100 text-green-800' :
                          phase.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {phase.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      {phase.description && (
                        <p className="text-gray-600 text-sm">{phase.description}</p>
                      )}
                      {phase.startDate && phase.endDate && (
                        <p className="text-gray-500 text-xs mt-1">
                          {formatDate(phase.startDate)} - {formatDate(phase.endDate)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Assessment */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Risk Assessment</h2>
              <div className="mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRiskColor(project.riskAssessment.level)}`}>
                  {project.riskAssessment.level.toUpperCase()} RISK
                </span>
              </div>
              {project.riskAssessment.factors && project.riskAssessment.factors.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Risk Factors</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {project.riskAssessment.factors.map((factor, index) => (
                      <li key={index}>{factor}</li>
                    ))}
                  </ul>
                </div>
              )}
              {project.riskAssessment.mitigation && project.riskAssessment.mitigation.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Mitigation Strategies</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {project.riskAssessment.mitigation.map((strategy, index) => (
                      <li key={index}>{strategy}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Developer Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Developer</h2>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {project.developer.firstName[0]}{project.developer.lastName[0]}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {project.developer.firstName} {project.developer.lastName}
                  </h3>
                  {project.developer.companyName && (
                    <p className="text-gray-600">{project.developer.companyName}</p>
                  )}
                  {project.developer.averageRating && (
                    <div className="flex items-center mt-1">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1 text-gray-600">{project.developer.averageRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Investment Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Investment Details</h2>
              
              {/* Funding Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Funding Progress</span>
                  <span className="font-semibold text-gray-900">{project.fundingProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${project.fundingProgress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{formatCurrency(project.raisedAmount)} raised</span>
                  <span>{formatCurrency(project.targetAmount)} target</span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <span>{formatCurrency(project.remainingAmount)} remaining</span>
                </div>
              </div>

              {/* Investment Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200">
                <div>
                  <p className="text-sm text-gray-500">ROI</p>
                  <p className="text-2xl font-bold text-green-600">{project.roi}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Term</p>
                  <p className="text-2xl font-bold text-gray-900">{project.investmentTerm} months</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Investors</p>
                  <p className="text-xl font-bold text-gray-900">{project.investorCount}</p>
                </div>
                {project.daysRemaining !== null && (
                  <div>
                    <p className="text-sm text-gray-500">Days Left</p>
                    <p className="text-xl font-bold text-gray-900">{project.daysRemaining}</p>
                  </div>
                )}
              </div>

              {/* Investment Form */}
              {project.canInvest ? (
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Investment Amount
                    </label>
                    <input
                      type="number"
                      min={project.minimumInvestment}
                      max={project.maximumInvestment || project.remainingAmount}
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="mt-2 text-xs text-gray-500">
                      Min: {formatCurrency(project.minimumInvestment)}
                      {project.maximumInvestment && ` • Max: ${formatCurrency(project.maximumInvestment)}`}
                    </div>
                  </div>

                  <button
                    onClick={handleInvest}
                    disabled={!investmentAmount || investmentAmount < project.minimumInvestment || processingPayment}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {processingPayment ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Invest Now'
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">
                    {project.status === 'funded' ? 'This project is fully funded' : 'Investment is not available at this time'}
                  </p>
                </div>
              )}

              {/* Location */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                <p className="text-sm text-gray-600">
                  {project.location.address}<br />
                  {project.location.city}, {project.location.state} {project.location.zipCode}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;



