import { auth } from './firebase';

const API_BASE = '/api';

class ApiService {
  private async getAuthToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: string; message?: string }> {
    const token = await this.getAuthToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, config);
    return response.json();
  }

  // Auth APIs
  async signUp(data: { email: string; password: string; name: string; institution?: string }) {
    return this.request('/auth?action=signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async signIn(data: { email: string; password: string }) {
    return this.request('/auth?action=signin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // User APIs
  async getUser(userId: string) {
    return this.request(`/users/${userId}`);
  }

  async updateProfile(userId: string, data: {
    name?: string;
    bio?: string;
    institution?: string;
    avatarURL?: string;
  }) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Hub APIs
  async getHubs(params?: {
    userId?: string;
    visibility?: 'public' | 'private';
    search?: string;
    tags?: string;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    return this.request(`/hubs?${searchParams.toString()}`);
  }

  async getHub(hubId: string) {
    return this.request(`/hubs/${hubId}`);
  }

  async createHub(data: {
    title: string;
    description: string;
    tags: string[];
    visibility: 'public' | 'private';
    previewImage?: string;
  }) {
    return this.request('/hubs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateHub(hubId: string, data: {
    title?: string;
    description?: string;
    tags?: string[];
    visibility?: 'public' | 'private';
    previewImage?: string;
  }) {
    return this.request(`/hubs/${hubId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteHub(hubId: string) {
    return this.request(`/hubs/${hubId}`, { method: 'DELETE' });
  }

  // Star APIs
  async starHub(hubId: string) {
    return this.request('/stars', {
      method: 'POST',
      body: JSON.stringify({ hubId }),
    });
  }

  async getStarredHubs() {
    return this.request('/stars');
  }

  // Comment APIs
  async createComment(hubId: string, text: string) {
    return this.request('/comments', {
      method: 'POST',
      body: JSON.stringify({ hubId, text }),
    });
  }

  async getComments(hubId: string) {
    return this.request(`/comments?hubId=${hubId}`);
  }

  // Follow APIs
  async followUser(targetUserId: string) {
    return this.request('/follows', {
      method: 'POST',
      body: JSON.stringify({ targetUserId }),
    });
  }

  async getFollows(userId: string, type: 'followers' | 'following') {
    return this.request(`/follows?userId=${userId}&type=${type}`);
  }

  // File APIs
  async uploadFile(file: File, hubId: string, fileName?: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('hubId', hubId);
    if (fileName) {
      formData.append('fileName', fileName);
    }

    const token = await this.getAuthToken();
    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    return response.json();
  }

  async getFiles(hubId: string) {
    return this.request(`/upload?hubId=${hubId}`);
  }

  async deleteFile(fileId: string) {
    return this.request(`/upload?fileId=${fileId}`, { method: 'DELETE' });
  }

  // Search API
  async search(query: string, type?: 'hubs' | 'users' | 'all', limit?: number) {
    const params = new URLSearchParams({ q: query });
    if (type) params.append('type', type);
    if (limit) params.append('limit', limit.toString());
    
    return this.request(`/search?${params.toString()}`);
  }

  // Settings APIs
  async sendEmailVerification() {
    return this.request('/auth/verify-email', {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();