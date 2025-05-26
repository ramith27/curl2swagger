const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://crul2swagger-api.we4u.pw'

// Auth interfaces
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  access_token: string
  user: {
    id: string
    email: string
    name: string
  }
}

export interface User {
  id: string
  email: string
  name: string
}

// Project interfaces
export interface Project {
  id: string
  name: string
  description: string
  createdAt: string
  captures: Capture[]
  activeSpec?: Spec
  qualityReport?: QualityReport
}

export interface Capture {
  id: string
  method: string
  url: string
  createdAt: string
  headers?: Record<string, string>
  body?: string
}

export interface Spec {
  id: string
  version: string
  filename: string
  content: string
  projectId: string
  createdAt: string
}

export interface QualityReport {
  overall: number
  lint: {
    score: number
    issues: QualityIssue[]
    suggestions: string[]
  }
  security: {
    securityScore: number
    vulnerabilities: SecurityVulnerability[]
    recommendations: string[]
  }
  performance: {
    performanceScore: number
    issues: PerformanceIssue[]
    recommendations: string[]
  }
  timestamp: string
  specVersion?: string
}

export interface QualityIssue {
  severity: 'error' | 'warning' | 'info'
  message: string
  path: string
  rule: string
}

export interface SecurityVulnerability {
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  recommendation: string
}

export interface PerformanceIssue {
  type: string
  severity: 'low' | 'medium' | 'high'
  message: string
  recommendation: string
}

export interface CreateProjectRequest {
  name: string
  description?: string
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
    // Try to get token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    }

    // Add authorization header if token exists
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }
    
    const response = await fetch(url, {
      headers,
      ...options,
    })

    if (!response.ok) {
      if (response.status === 401) {
        // Clear token on unauthorized
        this.clearToken()
        throw new Error('Authentication required')
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  getToken(): string | null {
    return this.token
  }

  // Auth methods
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    
    // Set token after successful login
    this.setToken(response.access_token)
    return response
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    
    // Set token after successful registration
    this.setToken(response.access_token)
    return response
  }

  logout() {
    this.clearToken()
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me')
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return this.request<Project[]>('/projects')
  }

  async getProject(id: string): Promise<Project> {
    return this.request<Project>(`/projects/${id}`)
  }

  async createProject(data: CreateProjectRequest): Promise<Project> {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async deleteProject(id: string): Promise<void> {
    return this.request<void>(`/projects/${id}`, {
      method: 'DELETE',
    })
  }

  // Captures
  async getProjectCaptures(projectId: string): Promise<Capture[]> {
    return this.request<Capture[]>(`/captures/project/${projectId}`)
  }

  async convertCurl(curlCommand: string, projectId?: string): Promise<Capture> {
    return this.request<Capture>('/captures/convert', {
      method: 'POST',
      body: JSON.stringify({ rawCurl: curlCommand, projectId }),
    })
  }

  async deleteCapture(id: string): Promise<void> {
    return this.request<void>(`/captures/${id}`, {
      method: 'DELETE',
    })
  }

  // Specs
  async getProjectSpecs(projectId: string): Promise<Spec[]> {
    return this.request<Spec[]>(`/specs/project/${projectId}`)
  }

  async generateSpec(projectId: string): Promise<Spec> {
    return this.request<Spec>('/specs/generate', {
      method: 'POST',
      body: JSON.stringify({ projectId }),
    })
  }

  async validateSpec(content: string): Promise<{ valid: boolean; errors: string[] }> {
    return this.request<{ valid: boolean; errors: string[] }>('/specs/validate', {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
  }

  // Quality
  async getQualityReport(projectId: string): Promise<QualityReport> {
    return this.request<QualityReport>(`/quality/report/${projectId}`)
  }

  async lintSpec(content: string): Promise<QualityReport> {
    return this.request<QualityReport>('/quality/lint', {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
  }
}

export const apiClient = new ApiClient()
