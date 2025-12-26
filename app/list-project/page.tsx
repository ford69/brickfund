'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Upload, 
  Plus, 
  X,
  ArrowLeft,
  Save,
  Eye,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient, UserSubscription } from '@/lib/api';
import { canCreateProject, getUpgradeMessage } from '@/lib/subscription-utils';

interface ProjectFormData {
  // Basic Information
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  
  // Location
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Financial Information
  targetAmount: string;
  minimumInvestment: string;
  maximumInvestment: string;
  roi: string;
  investmentTerm: string;
  distributionSchedule: string;
  totalProjectCost: string;
  projectedReturn: string;
  expectedCompletion: string;
  
  // Project Details
  highlights: string[];
  riskLevel: string;
  riskFactors: string[];
  mitigationStrategies: string[];
  
  // Timeline
  timeline: Array<{
    phase: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
  }>;
  
  // Images
  images: File[];
}

export default function ListProject() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [projectCount, setProjectCount] = useState(0);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    shortDescription: '',
    description: '',
    category: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Ghana',
    targetAmount: '',
    minimumInvestment: '',
    maximumInvestment: '',
    roi: '',
    investmentTerm: '',
    distributionSchedule: '',
    totalProjectCost: '',
    projectedReturn: '',
    expectedCompletion: '',
    highlights: [''],
    riskLevel: '',
    riskFactors: [''],
    mitigationStrategies: [''],
    timeline: [{
      phase: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'pending'
    }],
    images: []
  });

  // Check subscription and project count
  useEffect(() => {
    const checkSubscription = async () => {
      if (!isAuthenticated) {
        setCheckingSubscription(false);
        return;
      }

      try {
        const [subResponse, projectsResponse] = await Promise.all([
          apiClient.getUserSubscription(),
          apiClient.getAdminProjects({ status: 'all' }),
        ]);

        if (subResponse.success && subResponse.data) {
          setSubscription(subResponse.data);
        }

        if (projectsResponse.success && projectsResponse.data) {
          setProjectCount(projectsResponse.data.length);
        }
      } catch (error) {
        console.error('Failed to check subscription:', error);
      } finally {
        setCheckingSubscription(false);
      }
    };

    checkSubscription();
  }, [isAuthenticated]);

  // Log component lifecycle and step changes
  useEffect(() => {
    console.log('[ListProject] Component mounted/updated');
    console.log('[ListProject] Current step:', currentStep);
    console.log('[ListProject] Is loading:', isLoading);
    console.log('[ListProject] Has errors:', Object.keys(errors).length > 0);
  }, [currentStep, isLoading, errors]);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    console.log('[ListProject] User not authenticated, redirecting to signin');
    router.push('/signin');
    return null;
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleArrayFieldChange = (field: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field as keyof ProjectFormData].map((item: any, i: number) => 
        i === index ? value : item
      )
    }));
  };

  const addArrayField = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field as keyof ProjectFormData], '']
    }));
  };

  const removeArrayField = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field as keyof ProjectFormData].filter((_: any, i: number) => i !== index)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step: number): boolean => {
    console.log(`[ListProject] Validating step ${step}`);
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        console.log('[ListProject] Validating step 1 - Basic Info');
        if (!formData.title) newErrors.title = 'Project title is required';
        if (!formData.shortDescription) newErrors.shortDescription = 'Short description is required';
        if (!formData.description) newErrors.description = 'Description is required';
        if (!formData.category) newErrors.category = 'Category is required';
        break;
      case 2:
        console.log('[ListProject] Validating step 2 - Location');
        if (!formData.address) newErrors.address = 'Address is required';
        if (!formData.city) newErrors.city = 'City is required';
        if (!formData.state) newErrors.state = 'State is required';
        if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required';
        break;
      case 3:
        console.log('[ListProject] Validating step 3 - Financials');
        if (!formData.targetAmount) newErrors.targetAmount = 'Target amount is required';
        if (!formData.minimumInvestment) newErrors.minimumInvestment = 'Minimum investment is required';
        if (!formData.roi) newErrors.roi = 'ROI is required';
        if (!formData.investmentTerm) newErrors.investmentTerm = 'Investment term is required';
        break;
    }

    console.log(`[ListProject] Validation result for step ${step}:`, {
      hasErrors: Object.keys(newErrors).length > 0,
      errors: newErrors
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e?: React.MouseEvent) => {
    // Prevent form submission if called from button click
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log(`[ListProject] handleNext called for step ${currentStep}`);
    
    if (validateStep(currentStep)) {
      const nextStep = Math.min(currentStep + 1, 4);
      console.log(`[ListProject] Moving from step ${currentStep} to step ${nextStep}`);
      setCurrentStep(nextStep);
    } else {
      console.log(`[ListProject] Validation failed for step ${currentStep}, staying on current step`);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('[ListProject] ========== SUBMIT TRIGGERED ==========');
    console.log('[ListProject] Current step:', currentStep);
    console.log('[ListProject] Form data:', formData);
    
    if (!validateStep(currentStep)) {
      console.error('[ListProject] ❌ Validation failed, aborting submit');
      return;
    }

    // Check subscription limits before submitting
    if (!canCreateProject(subscription, projectCount)) {
      const upgradeMessage = getUpgradeMessage(subscription?.tier || null);
      setSubmitError(
        `You've reached your project limit. ${upgradeMessage} ` +
        `Please upgrade your subscription at /subscriptions or contact support.`
      );
      return;
    }

    setIsLoading(true);
    setSubmitError('');
    setSubmitSuccess(false);
    
    try {
      console.log('[ListProject] Preparing project data for backend...');
      
      // Validate numeric fields
      const targetAmount = parseFloat(formData.targetAmount);
      const minimumInvestment = parseFloat(formData.minimumInvestment);
      const roi = parseFloat(formData.roi);
      const investmentTerm = parseInt(formData.investmentTerm);

      if (isNaN(targetAmount) || targetAmount <= 0) {
        throw new Error('Target amount must be a valid positive number');
      }

      if (isNaN(minimumInvestment) || minimumInvestment <= 0) {
        throw new Error('Minimum investment must be a valid positive number');
      }

      if (isNaN(roi) || roi <= 0) {
        throw new Error('ROI must be a valid positive number');
      }

      if (isNaN(investmentTerm) || investmentTerm <= 0) {
        throw new Error('Investment term must be a valid positive number');
      }

      // Prepare the data for API submission
      const projectData: any = {
        title: formData.title.trim(),
        shortDescription: formData.shortDescription.trim(),
        description: formData.description.trim(),
        category: formData.category,
        location: {
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          zipCode: formData.zipCode.trim(),
          country: formData.country.trim() || 'Ghana'
        },
        targetAmount: targetAmount,
        minimumInvestment: minimumInvestment,
        roi: roi,
        investmentTerm: investmentTerm,
        status: 'pending',
        // Images will be uploaded separately and URLs will be added by the API
        highlights: formData.highlights.filter(h => h.trim()).filter(h => h.length > 0),
        financials: {},
        riskAssessment: {
          level: formData.riskLevel || 'medium',
          factors: formData.riskFactors.filter(r => r.trim()).filter(r => r.length > 0),
        }
      };

      // Add optional fields
      if (formData.maximumInvestment && formData.maximumInvestment.trim()) {
        const maxInvestment = parseFloat(formData.maximumInvestment);
        if (!isNaN(maxInvestment) && maxInvestment > 0) {
          projectData.maximumInvestment = maxInvestment;
        }
      }

      if (formData.totalProjectCost && formData.totalProjectCost.trim()) {
        const totalCost = parseFloat(formData.totalProjectCost);
        if (!isNaN(totalCost) && totalCost > 0) {
          projectData.financials.totalProjectCost = totalCost;
        }
      }

      if (formData.projectedReturn && formData.projectedReturn.trim()) {
        const projectedReturn = parseFloat(formData.projectedReturn);
        if (!isNaN(projectedReturn) && projectedReturn > 0) {
          projectData.financials.projectedReturn = projectedReturn;
        }
      }

      if (formData.expectedCompletion && formData.expectedCompletion.trim()) {
        projectData.financials.expectedCompletion = formData.expectedCompletion;
      }

      if (formData.distributionSchedule && formData.distributionSchedule.trim()) {
        projectData.distributionSchedule = formData.distributionSchedule;
      }

      // Clean up empty objects
      if (Object.keys(projectData.financials).length === 0) {
        projectData.financials = {};
      }

      // Ensure arrays are never undefined
      if (!projectData.highlights || projectData.highlights.length === 0) {
        projectData.highlights = [];
      }
      if (!projectData.riskAssessment.factors || projectData.riskAssessment.factors.length === 0) {
        projectData.riskAssessment.factors = [];
      }

      // Remove undefined values
      Object.keys(projectData).forEach(key => {
        if (projectData[key] === undefined) {
          delete projectData[key];
        }
      });

      console.log('[ListProject] Data prepared:', projectData);
      console.log('[ListProject] Images to upload:', formData.images.length, 'files');
      console.log('[ListProject] Sending request to backend API...');

      // Send request to backend API with images
      const response = await apiClient.createProject(projectData, formData.images);
      
      console.log('[ListProject] ========== BACKEND RESPONSE ==========');
      console.log('[ListProject] Response received:', response);
      console.log('[ListProject] Response success:', response.success);
      console.log('[ListProject] Response data:', response.data);
      console.log('[ListProject] Full response:', JSON.stringify(response, null, 2));

      // Check for success
      const isSuccess = response.success === true || (response.success === undefined && response.data);
      const hasData = response.data !== undefined && response.data !== null;

      if (isSuccess && hasData) {
        console.log('[ListProject] ✅ Project created successfully and saved to database:', response.data);
        setSubmitSuccess(true);
        setSubmitError('');
        
        setTimeout(() => {
          router.push('/owner-dashboard');
        }, 2000);
      } else if (isSuccess && !hasData) {
        console.warn('[ListProject] ⚠️ Backend returned success but no data. Project may still be saved.');
        setSubmitSuccess(true);
        setSubmitError('');
        setTimeout(() => {
          router.push('/owner-dashboard');
        }, 2000);
      } else {
        let errorMessage = 'Failed to create project listing';
        if (response.message) {
          errorMessage = response.message;
        } else if (response.error) {
          if (typeof response.error === 'string') {
            errorMessage = response.error;
          } else if (typeof response.error === 'object' && response.error !== null) {
            const errorObj = response.error as { message?: string };
            if (errorObj.message) {
              errorMessage = errorObj.message;
            }
          }
        }
        console.error('[ListProject] ❌ API error response:', {
          success: response.success,
          message: response.message,
          error: response.error,
          fullResponse: response
        });
        setSubmitError(errorMessage);
      }
    } catch (error: any) {
      console.error('[ListProject] ========== ERROR OCCURRED ==========');
      console.error('[ListProject] Error type:', typeof error);
      console.error('[ListProject] Error details:', error);
      console.error('[ListProject] Error stack:', error.stack);
      
      let errorMessage = 'Failed to create project listing. Please try again.';
      
      if (error && typeof error === 'object') {
        if (error.message) {
          errorMessage = error.message;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      console.error('[ListProject] Final error message:', errorMessage);
      setSubmitError(errorMessage);
    } finally {
      setIsLoading(false);
      console.log('[ListProject] Submit process completed. Loading:', false);
    }
  };

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
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/projects">
            <Button variant="ghost" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">List Your Project</h1>
          <p className="text-gray-600">
            Submit your real estate project for crowdfunding. Fill out the form below with all required information.
          </p>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Project submitted successfully! Your project has been saved to the database and is pending review. Redirecting...
            </div>
          </div>
        )}

        {/* Subscription Status Warning */}
        {checkingSubscription ? (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <div className="flex items-center">
              <Info className="h-5 w-5 mr-2" />
              Checking subscription status...
            </div>
          </div>
        ) : !canCreateProject(subscription, projectCount) && (
          <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">
                    Project Limit Reached
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    {getUpgradeMessage(subscription?.tier || null)}
                  </p>
                </div>
              </div>
              <Link href="/subscriptions">
                <Button size="sm" variant="outline">Upgrade Plan</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Error Message */}
        {submitError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {submitError}
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step < currentStep ? <CheckCircle className="h-4 w-4" /> : step}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step <= currentStep ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step === 1 && 'Basic Info'}
                  {step === 2 && 'Location'}
                  {step === 3 && 'Financials'}
                  {step === 4 && 'Review'}
                </span>
                {step < 4 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Basic Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter your project title"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>

                <div>
                  <Label htmlFor="shortDescription">Short Description *</Label>
                  <Textarea
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                    placeholder="Brief description of your project (max 200 characters)"
                    maxLength={200}
                    className={errors.shortDescription ? 'border-red-500' : ''}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.shortDescription.length}/200 characters
                  </p>
                  {errors.shortDescription && <p className="text-red-500 text-sm mt-1">{errors.shortDescription}</p>}
                </div>

                <div>
                  <Label htmlFor="description">Detailed Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Provide a detailed description of your project"
                    rows={6}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>

                <div>
                  <Label htmlFor="category">Project Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select project category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="luxury">Luxury</SelectItem>
                      <SelectItem value="sustainable">Sustainable</SelectItem>
                      <SelectItem value="heritage">Heritage</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                </div>

                <div>
                  <Label>Project Highlights</Label>
                  {formData.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <Input
                        value={highlight}
                        onChange={(e) => handleArrayFieldChange('highlights', index, e.target.value)}
                        placeholder="Enter a project highlight"
                      />
                      {formData.highlights.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeArrayField('highlights', index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayField('highlights')}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Highlight
                  </Button>
                </div>

                <div>
                  <Label htmlFor="images">Project Images</Label>
                  <p className="text-sm text-gray-500 mb-2">Upload images of your project (optional but recommended)</p>
                  <div className="mt-2">
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Label htmlFor="images">
                      <Button type="button" variant="outline" className="w-full" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Images
                        </span>
                      </Button>
                    </Label>
                    {formData.images.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Project ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                              {image.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {formData.images.length > 0 && (
                      <p className="text-sm text-gray-500 mt-2">
                        {formData.images.length} image{formData.images.length !== 1 ? 's' : ''} selected
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Project Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter street address"
                    className={errors.address ? 'border-red-500' : ''}
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Enter city"
                      className={errors.city ? 'border-red-500' : ''}
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <Label htmlFor="state">State/Region *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="Enter state or region"
                      className={errors.state ? 'border-red-500' : ''}
                    />
                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      placeholder="Enter ZIP or postal code"
                      className={errors.zipCode ? 'border-red-500' : ''}
                    />
                    {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                  </div>

                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      placeholder="Enter country"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Financial Information */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Financial Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="targetAmount">Target Amount (GHS) *</Label>
                    <Input
                      id="targetAmount"
                      type="number"
                      value={formData.targetAmount}
                      onChange={(e) => handleInputChange('targetAmount', e.target.value)}
                      placeholder="Enter target funding amount"
                      className={errors.targetAmount ? 'border-red-500' : ''}
                    />
                    {errors.targetAmount && <p className="text-red-500 text-sm mt-1">{errors.targetAmount}</p>}
                  </div>

                  <div>
                    <Label htmlFor="totalProjectCost">Total Project Cost (GHS)</Label>
                    <Input
                      id="totalProjectCost"
                      type="number"
                      value={formData.totalProjectCost}
                      onChange={(e) => handleInputChange('totalProjectCost', e.target.value)}
                      placeholder="Enter total project cost"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minimumInvestment">Minimum Investment (GHS) *</Label>
                    <Input
                      id="minimumInvestment"
                      type="number"
                      value={formData.minimumInvestment}
                      onChange={(e) => handleInputChange('minimumInvestment', e.target.value)}
                      placeholder="Enter minimum investment amount"
                      className={errors.minimumInvestment ? 'border-red-500' : ''}
                    />
                    {errors.minimumInvestment && <p className="text-red-500 text-sm mt-1">{errors.minimumInvestment}</p>}
                  </div>

                  <div>
                    <Label htmlFor="maximumInvestment">Maximum Investment (GHS)</Label>
                    <Input
                      id="maximumInvestment"
                      type="number"
                      value={formData.maximumInvestment}
                      onChange={(e) => handleInputChange('maximumInvestment', e.target.value)}
                      placeholder="Enter maximum investment amount (optional)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="roi">Projected ROI (%) *</Label>
                    <Input
                      id="roi"
                      type="number"
                      step="0.1"
                      value={formData.roi}
                      onChange={(e) => handleInputChange('roi', e.target.value)}
                      placeholder="Enter projected ROI percentage"
                      className={errors.roi ? 'border-red-500' : ''}
                    />
                    {errors.roi && <p className="text-red-500 text-sm mt-1">{errors.roi}</p>}
                  </div>

                  <div>
                    <Label htmlFor="investmentTerm">Investment Term (months) *</Label>
                    <Input
                      id="investmentTerm"
                      type="number"
                      value={formData.investmentTerm}
                      onChange={(e) => handleInputChange('investmentTerm', e.target.value)}
                      placeholder="Enter investment term in months"
                      className={errors.investmentTerm ? 'border-red-500' : ''}
                    />
                    {errors.investmentTerm && <p className="text-red-500 text-sm mt-1">{errors.investmentTerm}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="distributionSchedule">Distribution Schedule</Label>
                  <Select value={formData.distributionSchedule} onValueChange={(value) => handleInputChange('distributionSchedule', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select distribution schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                      <SelectItem value="at_completion">At Completion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="expectedCompletion">Expected Completion Date</Label>
                  <Input
                    id="expectedCompletion"
                    type="date"
                    value={formData.expectedCompletion}
                    onChange={(e) => handleInputChange('expectedCompletion', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Review and Submit */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Review Your Project</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-900">Review Your Information</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Please review all the information below before submitting your project. 
                        Once submitted, your project will be reviewed by our team before going live.
                      </p>
                    </div>
                  </div>
                </div>

                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="location">Location</TabsTrigger>
                    <TabsTrigger value="financials">Financials</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Project Title</Label>
                        <p className="text-sm text-gray-900">{formData.title}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Category</Label>
                        <Badge variant="secondary" className="capitalize">{formData.category}</Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Short Description</Label>
                      <p className="text-sm text-gray-900">{formData.shortDescription}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Detailed Description</Label>
                      <p className="text-sm text-gray-900">{formData.description}</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="location" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Address</Label>
                        <p className="text-sm text-gray-900">{formData.address}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">City</Label>
                        <p className="text-sm text-gray-900">{formData.city}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">State/Region</Label>
                        <p className="text-sm text-gray-900">{formData.state}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">ZIP Code</Label>
                        <p className="text-sm text-gray-900">{formData.zipCode}</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="financials" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Target Amount</Label>
                        <p className="text-sm text-gray-900">
                          {formData.targetAmount ? formatCurrency(parseFloat(formData.targetAmount)) : 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Minimum Investment</Label>
                        <p className="text-sm text-gray-900">
                          {formData.minimumInvestment ? formatCurrency(parseFloat(formData.minimumInvestment)) : 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Projected ROI</Label>
                        <p className="text-sm text-gray-900">{formData.roi}%</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Investment Term</Label>
                        <p className="text-sm text-gray-900">{formData.investmentTerm} months</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Project Highlights</Label>
                      <ul className="list-disc list-inside text-sm text-gray-900 mt-1">
                        {formData.highlights.filter(h => h.trim()).map((highlight, index) => (
                          <li key={index}>{highlight}</li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(1)}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>

              {currentStep < 4 ? (
                <Button 
                  type="button" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNext(e);
                  }}
                >
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Project'
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}