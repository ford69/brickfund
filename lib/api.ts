// API Configuration
// Note: Make sure NEXT_PUBLIC_API_URL in .env.local matches your backend port
// If backend runs on port 5001, set: NEXT_PUBLIC_API_URL=http://localhost:5001/api
// Normalize API_BASE_URL to always end with /api
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const API_BASE_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/$/, '')}/api`;

/** Build backend OAuth URL for redirect. Call in browser; backend should redirect back to /auth/callback?token=... */
export function getOAuthRedirectUrl(
  provider: 'google' | 'facebook',
  returnUrl?: string
): string {
  const redirectUri =
    typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '';
  const params = new URLSearchParams({ redirect_uri: redirectUri });
  if (returnUrl && typeof window !== 'undefined') {
    params.set('returnUrl', returnUrl);
  }
  return `${API_BASE_URL}/auth/${provider}?${params.toString()}`;
}

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

export interface KycDocuments {
  idFront?: string | null;
  idBack?: string | null;
  proofOfAddress?: string | null;
  bankStatement?: string | null;
  /** Backend may return snake_case; we check both */
  id_front?: string | null;
  id_back?: string | null;
  proof_of_address?: string | null;
  bank_statement?: string | null;
}

/** Get all KYC document URLs from object (handles both camelCase and snake_case) */
export function getKycDocumentUrls(docs: KycDocuments | null | undefined): Array<{ key: string; label: string; url: string }> {
  if (!docs) return [];
  const get = (camel: keyof KycDocuments, snake: string, label: string): string | null => {
    const v = (docs as any)[camel] ?? (docs as any)[snake];
    return v && String(v).trim() ? String(v).trim() : null;
  };
  const out: Array<{ key: string; label: string; url: string }> = [];
  const idFront = get('idFront', 'id_front', 'ID Front'); if (idFront) out.push({ key: 'idFront', label: 'ID Front', url: idFront });
  const idBack = get('idBack', 'id_back', 'ID Back'); if (idBack) out.push({ key: 'idBack', label: 'ID Back', url: idBack });
  const poa = get('proofOfAddress', 'proof_of_address', 'Proof of Address'); if (poa) out.push({ key: 'proofOfAddress', label: 'Proof of Address', url: poa });
  const bank = get('bankStatement', 'bank_statement', 'Bank Statement'); if (bank) out.push({ key: 'bankStatement', label: 'Bank Statement', url: bank });
  return out;
}

/** Check if any KYC document URLs exist (handles both camelCase and snake_case) */
export function hasAnyKycDocuments(docs: KycDocuments | null | undefined): boolean {
  return getKycDocumentUrls(docs).length > 0;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyName?: string;
  /** Profile picture URL (investor/owner/customer avatar) */
  avatarUrl?: string;
  // Role-based access:
  // - 'investor' → standard investing user (can invest in projects)
  // - 'owner' → project owner / owner dashboard
  // - 'customer' → marketplace-only user (can shop but not invest or own projects)
  // - 'admin' → platform administrator
  role: 'investor' | 'owner' | 'customer' | 'admin';
  kycStatus: 'pending' | 'verified' | 'rejected';
  kycDocuments?: KycDocuments;
  hasUploadedDocuments?: boolean;
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
  developer: User | null;
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
    project: string | { title?: string; name?: string };
    date: string;
    status: string;
  }>;
}

export interface InvestorDashboardData {
  stats: {
    totalInvested: number;
    portfolioValue: number;
    totalReturns: number;
    activeInvestments: number;
    projectedAnnualReturn: number;
  };
  recentInvestments: Array<Investment & {
    project?: Project | string;
    projectName?: string;
  }>;
  recentPayments: Array<{
    _id: string;
    amount: number;
    currency: string;
    status: string;
    projectId: string;
    project?: Project | string;
    createdAt: string;
  }>;
  recentDistributions: Array<{
    _id: string;
    amount: number;
    investmentId: string;
    investment?: Investment;
    projectId: string;
    project?: Project | string;
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

export interface MarketplaceItem {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  /** Pricing unit metadata (optional, for building materials/tools) */
  unitType?: string;   // e.g. 'piece', 'bundle', 'bag', 'm3'
  unitLabel?: string;  // e.g. 'bundle of 10 planks', 'per cubic meter'
  unitSize?: number;   // e.g. 10 when one unit represents 10 pieces
  /** Fulfillment: small → motor bike, medium → mini truck, large → truck */
  fulfillmentTier?: 'small' | 'medium' | 'large';
  image?: string;
  imageUrl?: string; // Cloudinary URL from backend
  images?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Get display image URL for a marketplace item (backend may use imageUrl, image, or images) */
export function getMarketplaceItemImageUrl(item: MarketplaceItem | null | undefined): string | null {
  if (!item) return null;
  return item.imageUrl ?? item.image ?? (item.images && item.images[0]) ?? null;
}

/** Order status for tracking (backend may use a subset or different labels) */
export type OrderStatus =
  | 'pending'      // Order request received
  | 'paid'         // Quote shared with customer
  | 'processing'   // Customer confirmed order
  | 'shipped'      // Preparing dispatch
  | 'out_for_delivery'
  | 'delivered'
  | 'failed'
  | 'cancelled';

export interface MarketplacePurchase {
  _id: string;
  userId: string;
  itemId: string;
  item?: MarketplaceItem;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  /** Extended status for order tracking (if backend supports) */
  orderStatus?: OrderStatus;
  paymentReference?: string;
  createdAt: string;
  updatedAt: string;
  /** Fulfillment */
  fulfillmentMethod?: 'delivery' | 'pickup';
  deliveryZoneId?: string;
  deliveryZoneName?: string;
  deliveryAddress?: string;
  timeline?: 'urgent' | 'flexible';
  notes?: string;
  quoteAmount?: number;
  quoteCurrency?: string;
  quoteDeliveryWindow?: string;
  quoteMessage?: string;
  quotedAt?: string;
  /** Tracking */
  estimatedDeliveryAt?: string;
  deliveredAt?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  /** Multi-item orders: line items (backend may populate for cart orders) */
  items?: Array<{ itemId: string; item?: MarketplaceItem; quantity: number; price: number }>;
}

export interface MarketplaceOrderRequestPayload {
  items: Array<{ itemId: string; quantity: number }>;
  deliveryAddress: string;
  timeline: 'urgent' | 'flexible';
  notes?: string;
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

    // Always get the latest token from localStorage to ensure it's up-to-date
    const currentToken = this.getToken();

    const headers: HeadersInit = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(currentToken && { Authorization: `Bearer ${currentToken}` }),
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
        if (response.status === 401) {
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
          }
        }
        const err = new Error(errorMessage) as Error & { status?: number };
        err.status = response.status;
        throw err;
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

  /** Write token and confirm localStorage read-back (avoids redirect-before-persist races). */
  persistToken(token: string): boolean {
    if (typeof window === 'undefined') return false;
    try {
      localStorage.setItem('token', token);
      this.token = token;
      return localStorage.getItem('token') === token;
    } catch {
      return false;
    }
  }

  persistRefreshToken(refreshToken: string): boolean {
    if (typeof window === 'undefined') return false;
    try {
      localStorage.setItem('refreshToken', refreshToken);
      return localStorage.getItem('refreshToken') === refreshToken;
    } catch {
      return false;
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  }

  // Get current token from localStorage (always fresh)
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      // Update instance token if it exists
      if (token) {
        this.token = token;
      }
      return token;
    }
    return this.token;
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
    /** Filter by project owner/developer ID (backend may support ownerId or developerId) */
    ownerId?: string;
    developerId?: string;
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
  /**
   * Fetch public profile of a project owner by ID. Used on the Owner Profile page.
   * Tries GET /owners/:id then GET /users/:id/public. If neither exists, returns { success: false }.
   */
  async getOwnerPublicProfile(ownerId: string): Promise<ApiResponse<User & { totalProjects?: number; averageRating?: number; totalRaised?: number }>> {
    type OwnerProfile = User & { totalProjects?: number; averageRating?: number; totalRaised?: number };
    try {
      return await this.request<OwnerProfile>(`/owners/${ownerId}`);
    } catch {
      try {
        const res = await this.request<User>(`/users/${ownerId}/public`);
        return res as ApiResponse<OwnerProfile>;
      } catch {
        return { success: false, message: 'Owner profile not found' };
      }
    }
  }

  /**
   * Fetch public profile of an investor by ID. Used on the Investor Profile page.
   * Tries GET /investors/:id then GET /users/:id/public.
   */
  async getInvestorPublicProfile(investorId: string): Promise<ApiResponse<User & { totalInvested?: number; investmentCount?: number }>> {
    type InvestorProfile = User & { totalInvested?: number; investmentCount?: number };
    try {
      return await this.request<InvestorProfile>(`/investors/${investorId}`);
    } catch {
      try {
        const res = await this.request<User>(`/users/${investorId}/public`);
        return res as ApiResponse<InvestorProfile>;
      } catch {
        return { success: false, message: 'Investor profile not found' };
      }
    }
  }

  /**
   * Fetch investments for a given investor (for public profile). Tries GET /investors/:id/investments.
   * Returns list of investments with project details when available.
   */
  async getInvestorInvestments(investorId: string, params?: { limit?: number }): Promise<ApiResponse<(Investment & { project?: Project })[]>> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const qs = searchParams.toString();
    const endpoint = qs ? `/investors/${investorId}/investments?${qs}` : `/investors/${investorId}/investments`;
    try {
      return await this.request<(Investment & { project?: Project })[]>(endpoint);
    } catch {
      return { success: false, data: [], message: 'Investments not available' };
    }
  }

  async getUserProfile() {
    return this.request<User>('/users/profile');
  }

  async updateUserProfile(profileData: Partial<User>) {
    return this.request<User>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  /** Change password for the current user. Requires current password and new password. */
  async changePassword(currentPassword: string, newPassword: string) {
    return this.request<{ message?: string }>('/users/profile/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  /**
   * Upload a profile picture (avatar). Tries POST /users/profile/avatar; falls back to
   * generic document upload + updateUserProfile(avatarUrl).
   */
  async uploadProfileImage(file: File): Promise<{ success: boolean; data?: User; message?: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('avatar', file);
      const res = await this.request<{ url?: string; user?: User }>('/users/profile/avatar', {
        method: 'POST',
        body: formData,
      }) as any;
      const url = res?.data?.url ?? res?.url;
      const user = res?.data?.user ?? res?.user;
      if (user) return { success: true, data: user };
      if (url) {
        const update = await this.updateUserProfile({ avatarUrl: url });
        if (update.success && update.data) return { success: true, data: update.data };
      }
    } catch {
      // Fallback: upload as document then set avatarUrl
    }
    try {
      const formData = new FormData();
      formData.append('files', file);
      formData.append('category', 'avatar');
      const uploadRes = await this.request<{ url?: string; fileUrl?: string }[]>('/documents', { method: 'POST', body: formData }) as any;
      const arr = Array.isArray(uploadRes?.data) ? uploadRes.data : Array.isArray(uploadRes) ? uploadRes : [];
      const first = arr[0];
      const url = first?.url ?? first?.fileUrl;
      if (!url) throw new Error('No URL returned from upload');
      const update = await this.updateUserProfile({ avatarUrl: url });
      return update.success && update.data ? { success: true, data: update.data } : { success: false, message: 'Failed to update profile' };
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : 'Upload failed' };
    }
  }

  /** Update KYC documents. Use camelCase keys (idFront, idBack, proofOfAddress, bankStatement). */
  async updateKycDocuments(docs: Partial<KycDocuments>) {
    return this.request<User>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify({
        kycDocuments: {
          idFront: docs.idFront ?? undefined,
          idBack: docs.idBack ?? undefined,
          proofOfAddress: docs.proofOfAddress ?? undefined,
          bankStatement: docs.bankStatement ?? undefined,
        },
      }),
    });
  }

  /**
   * Upload a KYC document file and save the URL to the user's profile.
   * Tries POST /users/kyc/upload first; falls back to /documents + updateKycDocuments.
   * Backend must have kycDocuments on the User model for this to persist.
   */
  async uploadKycDocument(
    file: File,
    documentType: 'idFront' | 'idBack' | 'proofOfAddress' | 'bankStatement'
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Try KYC-specific upload endpoint first (backend saves directly to user.kycDocuments)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      const kycResponse = await this.request<{ url?: string; success?: boolean }>('/users/kyc/upload', {
        method: 'POST',
        body: formData,
      });
      if (kycResponse.success) {
        return { success: true };
      }
    } catch {
      // Fallback: use generic documents upload, then update user profile
    }
    try {
      const formData = new FormData();
      formData.append('files', file);
      formData.append('category', 'kyc');
      const uploadRes = await this.request<DocumentFile[]>('/documents', { method: 'POST', body: formData }) as any;
      const arr = uploadRes?.data ?? uploadRes;
      const first = Array.isArray(arr) ? arr[0] : null;
      const url = first?.url ?? first?.fileUrl;
      if (!url) throw new Error('No URL returned from upload');
      const profileRes = await this.getUserProfile() as any;
      const user = profileRes?.data ?? profileRes;
      const current = user?.kycDocuments || {};
      await this.updateKycDocuments({ ...current, [documentType]: url });
      return { success: true };
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : 'Upload failed' };
    }
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

  async initializePayment(paymentData: { 
    projectId: string; 
    amount: number; 
    email: string;
    metadata?: Record<string, any>;
  }) {
    return this.request<{
      authorization_url?: string;
      authorizationUrl?: string;
      access_code?: string;
      accessCode?: string;
      reference: string;
      paymentId?: string;
    }>('/payments/initialize', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async verifyPayment(reference: string) {
    return this.request<{
      status: string;
      payment?: {
        _id: string;
        paystackReference?: string;
        amount: number;
        currency: string;
        projectId?: string;
        status: string;
      };
      investment?: Investment;
      transaction?: any;
    }>(`/payments/verify/${reference}`, {
      method: 'GET',
    });
  }

  async getInvestment(id: string) {
    return this.request<Investment>(`/investments/${id}`);
  }

  // Admin API
  async getDashboardStats() {
    return this.request('/admin/dashboard');
  }

  async getAdminDashboardStats() {
    return this.request<{
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
    }>('/admin/dashboard/stats');
  }

  async getAdminUsers(params?: { page?: number; limit?: number; role?: string; kycStatus?: string; search?: string }) {
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

  async getAllUsers(params?: { page?: number; limit?: number; role?: string; kycStatus?: string }) {
    return this.getAdminUsers(params);
  }

  async updateUserStatus(userId: string, isActive: boolean) {
    return this.request<User>(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  }

  async updateAdminUser(userId: string, userData: Partial<User>) {
    return this.request<User>(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: string) {
    return this.request(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async getAdminProjects(params?: { page?: number; limit?: number; status?: string; category?: string; search?: string }) {
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

  async getAllProjects(params?: { page?: number; limit?: number; status?: string; category?: string }) {
    return this.getAdminProjects(params);
  }

  async updateProjectStatus(projectId: string, status: string) {
    return this.request<Project>(`/admin/projects/${projectId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async approveProject(projectId: string, reason?: string) {
    return this.request<Project>(`/admin/projects/${projectId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async rejectProject(projectId: string, reason: string) {
    return this.request<Project>(`/admin/projects/${projectId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getPendingAccountApprovals(params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/admin/accounts/pending?${queryString}` : '/admin/accounts/pending';
    
    return this.request<Array<{
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: 'investor' | 'owner';
      status: 'pending' | 'approved' | 'rejected';
      createdAt: string;
      companyName?: string;
    }>>(endpoint);
  }

  async approveAccount(accountId: string, reason?: string) {
    return this.request<User>(`/admin/accounts/${accountId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async rejectAccount(accountId: string, reason: string) {
    return this.request<User>(`/admin/accounts/${accountId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
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

  async getKycDocumentsForUser(userId: string) {
    return this.request<{
      user: { id?: string; _id?: string; firstName: string; lastName: string; email: string; role: string; companyName?: string; kycStatus: string; createdAt: string };
      kycDocuments?: KycDocuments;
      documents?: Array<{ type: string; label: string; url: string }>;
      hasUploadedDocuments: boolean;
    }>(`/admin/kyc/users/${userId}/documents`);
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

  // Unified dashboard (automatically routes based on user role)
  async getDashboard() {
    return this.request<OwnerDashboardData | InvestorDashboardData | any>('/users/dashboard');
  }

  // Role-specific dashboard endpoints
  async getOwnerDashboard() {
    return this.request<OwnerDashboardData>('/owner/dashboard');
  }

  async getInvestorDashboard() {
    return this.request<InvestorDashboardData>('/investor/dashboard');
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

  // Marketplace API (Admin)
  // NOTE: Backend must implement /admin/marketplace/items endpoints that accept 'admin' role
  // These endpoints should be separate from /marketplace/items which is for 'owner' role
  async getMarketplaceItems(params?: { page?: number; limit?: number; category?: string; isActive?: boolean }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    // Use admin endpoint for admin operations - requires backend to accept 'admin' role
    const endpoint = queryString ? `/admin/marketplace/items?${queryString}` : '/admin/marketplace/items';
    return this.request<MarketplaceItem[]>(endpoint);
  }

  async getMarketplaceItem(itemId: string) {
    // Public endpoint for product detail (guests + logged-in). Backend must allow GET without auth.
    try {
      return await this.request<MarketplaceItem>(`/marketplace/items/${itemId}`);
    } catch {
      return this.request<MarketplaceItem>(`/admin/marketplace/items/${itemId}`);
    }
  }

  async createMarketplaceItem(itemData: {
    name: string;
    description: string;
    category: string;
    price: number;
    currency: string;
    sku?: string;
    brand?: string;
    stock?: number;
    unitType?: string;
    unitLabel?: string;
    unitSize?: number;
    fulfillmentTier?: 'small' | 'medium' | 'large';
    tags?: string[];
    image?: string;
    images?: string[];
    isActive?: boolean;
  }) {
    // Use admin endpoint for admin operations - requires backend to accept 'admin' role
    // Backend endpoint: POST /admin/marketplace/items
    // Required role: 'admin'
    return this.request<MarketplaceItem>('/admin/marketplace/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  /**
   * Create marketplace item with image upload (multipart/form-data).
   * Single request to POST /admin/marketplace/items/with-image
   */
  async createMarketplaceItemWithImage(formData: FormData) {
    return this.request<MarketplaceItem>('/admin/marketplace/items/with-image', {
      method: 'POST',
      body: formData,
    });
  }

  async updateMarketplaceItem(itemId: string, itemData: Partial<MarketplaceItem>) {
    // Use admin endpoint for admin operations
    return this.request<MarketplaceItem>(`/admin/marketplace/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });
  }

  async deleteMarketplaceItem(itemId: string) {
    // Use admin endpoint for admin operations
    return this.request(`/admin/marketplace/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  async toggleMarketplaceItemStatus(itemId: string, isActive: boolean) {
    // Use admin endpoint for admin operations
    return this.request<MarketplaceItem>(`/admin/marketplace/items/${itemId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  }

  // Marketplace API (Real Estate - View & Purchase)
  async getActiveMarketplaceItems(params?: { page?: number; limit?: number; category?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/marketplace/items/active?${queryString}` : '/marketplace/items/active';
    return this.request<MarketplaceItem[]>(endpoint);
  }

  async initializeMarketplacePurchase(itemId: string) {
    return this.request<{
      authorization_url?: string;
      authorizationUrl?: string;
      access_code?: string;
      accessCode?: string;
      reference: string;
      paymentId?: string;
    }>('/marketplace/purchase/initialize', {
      method: 'POST',
      body: JSON.stringify({ itemId }),
    });
  }

  /**
   * Initialize Paystack payment for cart checkout.
   * Backend: POST /marketplace/purchase/initialize-cart
   * Body: { items: [{ itemId: string, quantity: number }], successUrl?: string, cancelUrl?: string }
   * Returns: { authorization_url, reference } for total cart amount.
   */
  async initializeMarketplaceCartPurchase(items: { itemId: string; quantity: number }[], options?: { successUrl?: string; cancelUrl?: string }) {
    return this.request<{
      authorization_url?: string;
      authorizationUrl?: string;
      access_code?: string;
      accessCode?: string;
      reference: string;
      paymentId?: string;
    }>('/marketplace/purchase/initialize-cart', {
      method: 'POST',
      body: JSON.stringify({
        items,
        successUrl: options?.successUrl,
        cancelUrl: options?.cancelUrl,
      }),
    });
  }

  /**
   * Create a marketplace order request (quote-first flow, no payment step).
   * Tries common endpoint variants to support backend transition.
   */
  async createMarketplaceOrderRequest(payload: MarketplaceOrderRequestPayload) {
    const candidates = [
      '/marketplace/orders/request',
      '/marketplace/orders',
    ];

    let lastError: unknown = null;
    let allNotFound = true;
    for (const endpoint of candidates) {
      try {
        return await this.request<MarketplacePurchase>(endpoint, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      } catch (error) {
        lastError = error;
        const status = (error as Error & { status?: number })?.status;
        if (status !== 404) {
          allNotFound = false;
        }
      }
    }

    if (allNotFound) {
      throw new Error('Order request service is not available in this environment yet. Please contact support to enable marketplace order requests.');
    }

    throw lastError instanceof Error
      ? lastError
      : new Error('Unable to submit order request. Please contact support.');
  }

  async getMarketplacePurchases(params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/marketplace/purchases?${queryString}` : '/marketplace/purchases';
    return this.request<MarketplacePurchase[]>(endpoint);
  }

  async getMarketplaceOrder(orderId: string) {
    return this.request<MarketplacePurchase>(`/marketplace/purchases/${orderId}`);
  }

  /**
   * Admin: list all marketplace orders/purchases for management.
   * Backend: GET /admin/marketplace/orders
   */
  async getAdminMarketplaceOrders(params?: { status?: OrderStatus; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/admin/marketplace/orders?${queryString}` : '/admin/marketplace/orders';
    try {
      return await this.request<MarketplacePurchase[]>(endpoint);
    } catch (error) {
      const status = (error as Error & { status?: number })?.status;
      // Backward compatibility: some backend deployments still expose transactions, not orders.
      if (status !== 404) throw error;

      const fallbackEndpoint = queryString
        ? `/admin/marketplace/transactions?${queryString}`
        : '/admin/marketplace/transactions';
      const fallback = await this.request<any[]>(fallbackEndpoint);

      if (!fallback.success || !fallback.data) {
        return fallback as ApiResponse<MarketplacePurchase[]>;
      }

      const normalized = (fallback.data as any[]).map((row) => ({
        ...row,
        orderStatus: row.orderStatus || row.purchaseStatus || row.status || 'pending',
        status: row.status || row.purchaseStatus || 'pending',
        amount: typeof row.amount === 'number' ? row.amount : 0,
        currency: row.currency || 'GHS',
      })) as MarketplacePurchase[];

      return {
        ...fallback,
        data: normalized,
      };
    }
  }

  /**
   * Admin: update order status and tracking fields for an order.
   * Backend: PUT /admin/marketplace/orders/:orderId
   */
  async updateMarketplaceOrderStatus(
    orderId: string,
    payload: {
      orderStatus?: OrderStatus;
      estimatedDeliveryAt?: string | null;
      deliveredAt?: string | null;
      trackingNumber?: string | null;
      trackingUrl?: string | null;
      quoteAmount?: number;
      quoteCurrency?: string;
      quoteDeliveryWindow?: string;
      quoteMessage?: string;
      sendQuoteEmail?: boolean;
    }
  ) {
    try {
      return await this.request<MarketplacePurchase>(`/admin/marketplace/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } catch (error) {
      const status = (error as Error & { status?: number })?.status;
      if (status !== 404) throw error;
      // Older backends may only support PATCH for this endpoint.
      return this.request<MarketplacePurchase>(`/admin/marketplace/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    }
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Types are already exported via their interface declarations above
// No need to re-export them here