// API Configuration
// Note: Make sure NEXT_PUBLIC_API_URL in .env.local matches your backend port
// If backend runs on port 5001, set: NEXT_PUBLIC_API_URL=http://localhost:5001/api
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Currency formatting utility
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin' | 'developer';
  kycStatus: 'pending' | 'verified' | 'rejected';
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  shortDescription: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  category: 'residential' | 'commercial' | 'luxury' | 'sustainable' | 'heritage';
  images: string[];
  targetAmount: number;
  raisedAmount: number;
  minimumInvestment: number;
  roi: number;
  status: 'draft' | 'pending' | 'active' | 'funded' | 'completed' | 'cancelled';
  developer: User;
  highlights: string[];
  financials: {
    totalProjectCost: number;
    projectedReturn: number;
    expectedCompletion: string;
  };
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
  };
  investorCount: number;
  fundingProgress: number;
  timeRemaining?: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Investment {
  _id: string;
  userId: string;
  projectId: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  investmentDate: string;
  expectedReturn: number;
  actualReturn?: number;
  totalDistributions: number;
  currentValue: number;
  totalReturnPercentage: string;
}

export interface DocumentFile {
  _id: string;
  name: string;
  type: string;
  category: string;
  project?: Project | string | null;
  size: number;
  url?: string;
  uploadedAt: string;
  status: 'pending' | 'verified' | 'rejected';
  description?: string;
  uploadedBy?: User | string;
}

export interface Notification {
  _id: string;
  type: 'investment' | 'project' | 'system' | 'payout';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: string;
}

export interface Transaction {
  _id: string;
  type: 'investment' | 'distribution' | 'withdrawal';
  amount: number;
  project: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  reference: string;
}

export interface OwnerDashboardData {
  stats: {
    totalProjects: number;
    totalRaised: number;
    totalInvestors: number;
    averageROI: number;
  };
  projects: Array<Project & {
    progress?: number;
    investorCount?: number;
    timeLeft?: string;
    milestones?: Array<{
      phase: string;
      status: 'completed' | 'in-progress' | 'pending';
      date: string;
    }>;
  }>;
  recentInvestors: Array<{
    _id: string;
    name: string;
    amount: number;
    project: string;
    date: string;
    status: string;
  }>;
}

export interface HowItWorksContent {
  steps: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    features: string[];
    order: number;
  }>;
  benefits: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
  }>;
  faqs: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
}

// API Client Class
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const isFormData =
      typeof FormData !== 'undefined' && options.body instanceof FormData;

    const headers: HeadersInit = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...(options.headers || {}),
    };
    
    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      console.log(`[API] Making ${options.method || 'GET'} request to: ${url}`);
      if (options.body && !(options.body instanceof FormData)) {
        console.log('[API] Request body:', JSON.parse(options.body as string));
      }
      
      const response = await fetch(url, config);
      
      // Check if response has content before trying to parse JSON
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        try {
          data = text ? JSON.parse(text) : {};
        } catch (parseError) {
          console.error('[API] Failed to parse JSON response:', text);
          throw new Error('Invalid JSON response from server');
        }
      } else {
        data = { message: await response.text() || 'No content' };
      }

      console.log(`[API] Response status: ${response.status}`, data);

      if (!response.ok) {
        const errorMessage = data.error?.message || data.message || data.error || `HTTP ${response.status}: An error occurred`;
        console.error('[API] Request failed:', errorMessage);
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('[API] Request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  // Auth API
  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
    companyName?: string;
  }) {
    const response = await this.request<{ user: User; token: string; refreshToken: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(userData),
      }
    );
    
    if (response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async login(credentials: { email: string; password: string }) {
    const response = await this.request<{ user: User; token: string; refreshToken: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    );
    
    if (response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async logout() {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });
    
    this.clearToken();
    return response;
  }

  async refreshToken(refreshToken: string) {
    const response = await this.request<{ token: string; refreshToken: string }>(
      '/auth/refresh-token',
      {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }
    );
    
    if (response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  // Projects API
  async getProjects(params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    location?: string;
    minAmount?: number;
    maxAmount?: number;
    minROI?: number;
    maxROI?: number;
    search?: string;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/projects?${queryString}` : '/projects';
    
    return this.request<Project[]>(endpoint);
  }

  async getProject(id: string) {
    return this.request<Project>(`/projects/${id}`);
  }

  async getFeaturedProjects(limit: number = 6) {
    return this.request<Project[]>(`/projects/featured?limit=${limit}`);
  }

  async searchProjects(query: string, filters?: any) {
    const searchParams = new URLSearchParams({ q: query });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request<Project[]>(`/projects/search?${searchParams.toString()}`);
  }

  async getProjectStats() {
    return this.request('/projects/stats');
  }

  async uploadProjectImages(images: File[]) {
    if (!images || images.length === 0) {
      console.log('[API] No images to upload, returning empty array');
      return { success: true, data: [] };
    }

    console.log('[API] Step 1: Preparing to upload images to /api/projects/upload-images');
    console.log('[API] Number of images:', images.length);
    images.forEach((file, index) => {
      console.log(`[API] Image ${index + 1}: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    });

    const formData = new FormData();
    images.forEach((file) => {
      formData.append('images', file);
    });

    console.log('[API] Step 1: Sending FormData to /api/projects/upload-images');
    const response = await this.request<string[]>('/projects/upload-images', {
      method: 'POST',
      body: formData,
    });

    console.log('[API] Step 1: Image upload response received:', response);
    return response;
  }

  async createProject(projectData: any, images?: File[]) {
    // Step 1: Upload images first if provided
    if (images && images.length > 0) {
      try {
        console.log('[API] ========== IMAGE UPLOAD PROCESS ==========');
        console.log('[API] Step 1: Uploading images to /api/projects/upload-images');
        
        const uploadResponse = await this.uploadProjectImages(images);
        
        console.log('[API] Step 1: Upload response:', {
          success: uploadResponse.success,
          hasData: !!uploadResponse.data,
          dataLength: uploadResponse.data?.length || 0
        });
        
        // Step 2: Get image URLs from response
        if (uploadResponse.success && uploadResponse.data && Array.isArray(uploadResponse.data)) {
          console.log('[API] Step 2: Got image URLs from response:', uploadResponse.data);
          projectData.images = uploadResponse.data;
          console.log('[API] Step 2: Image URLs added to project data:', projectData.images);
        } else {
          console.warn('[API] Step 2: Image upload failed or returned no URLs');
          console.warn('[API] Response details:', {
            success: uploadResponse.success,
            data: uploadResponse.data,
            message: uploadResponse.message,
            error: uploadResponse.error
          });
          projectData.images = [];
        }
      } catch (error) {
        console.error('[API] Step 1: Error uploading images:', error);
        console.error('[API] Continuing with project creation without images');
        projectData.images = [];
      }
    } else {
      console.log('[API] No images provided, using empty array');
      projectData.images = projectData.images || [];
    }

    // Step 3: Create project with image URLs at /api/projects
    console.log('[API] ========== PROJECT CREATION PROCESS ==========');
    console.log('[API] Step 3: Creating project at /api/projects with image URLs');
    console.log('[API] Project data images field:', projectData.images);
    
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(projectId: string, projectData: any) {
    return this.request<Project>(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  // User API
  async getUserProfile() {
    return this.request<User>('/users/profile');
  }

  async updateUserProfile(profileData: Partial<User>) {
    return this.request<User>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getUserInvestments(params?: { page?: number; limit?: number; status?: string }) {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/users/investments?${queryString}` : '/users/investments';
    
    return this.request<Investment[]>(endpoint);
  }

  async getUserPortfolio() {
    return this.request('/users/portfolio');
  }

  // Investment API
  async createInvestment(investmentData: { projectId: string; amount: number }) {
    return this.request<Investment>('/investments', {
      method: 'POST',
      body: JSON.stringify(investmentData),
    });
  }

  async getInvestment(id: string) {
    return this.request<Investment>(`/investments/${id}`);
  }

  // Admin API
  async getDashboardStats() {
    return this.request('/admin/dashboard');
  }

  async getAllUsers(params?: { page?: number; limit?: number; role?: string; kycStatus?: string }) {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/admin/users?${queryString}` : '/admin/users';
    
    return this.request<User[]>(endpoint);
  }

  async updateUserStatus(userId: string, isActive: boolean) {
    return this.request<User>(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  }

  async getAllProjects(params?: { page?: number; limit?: number; status?: string; category?: string }) {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/admin/projects?${queryString}` : '/admin/projects';
    
    return this.request<Project[]>(endpoint);
  }

  async updateProjectStatus(projectId: string, status: string) {
    return this.request<Project>(`/admin/projects/${projectId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getKycPendingUsers(params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/admin/kyc/pending?${queryString}` : '/admin/kyc/pending';
    
    return this.request<User[]>(endpoint);
  }

  async approveKyc(userId: string, reason?: string) {
    return this.request<User>(`/admin/kyc/${userId}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  }

  async rejectKyc(userId: string, reason?: string) {
    return this.request<User>(`/admin/kyc/${userId}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  }

  // Documents API
  async getDocuments(params?: { category?: string; search?: string; projectId?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/documents?${queryString}` : '/documents';
    return this.request<DocumentFile[]>(endpoint);
  }

  async uploadDocuments(formData: FormData) {
    return this.request<DocumentFile[]>('/documents', {
      method: 'POST',
      body: formData,
    });
  }

  async deleteDocument(documentId: string) {
    return this.request(`/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  async bulkDeleteDocuments(documentIds: string[]) {
    return this.request('/documents/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ documentIds }),
    });
  }

  // Notifications API
  async getNotifications(params?: { isRead?: boolean }) {
    const searchParams = new URLSearchParams();
    if (params?.isRead !== undefined) {
      searchParams.append('isRead', String(params.isRead));
    }
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/notifications?${queryString}` : '/notifications';
    return this.request<Notification[]>(endpoint);
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request<Notification>(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', {
      method: 'PATCH',
    });
  }

  // Owner dashboard
  async getOwnerDashboard() {
    return this.request<OwnerDashboardData>('/owner/dashboard');
  }

  // Transactions
  async getUserTransactions(params?: { page?: number; limit?: number; type?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/users/transactions?${queryString}` : '/users/transactions';
    return this.request<Transaction[]>(endpoint);
  }

  // Marketing content
  async getHowItWorksContent() {
    return this.request<HowItWorksContent>('/content/how-it-works');
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export types
export type { User, Project, Investment, DocumentFile, Notification, Transaction, OwnerDashboardData, HowItWorksContent, ApiResponse };