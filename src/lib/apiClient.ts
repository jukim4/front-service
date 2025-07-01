import { useAuthStore } from '@/store/authStore';

const URL = process.env.NEXT_PUBLIC_URL || 'http://localhost';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const { accessToken } = useAuthStore.getState();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, config);

    if (response.status === 401) {
      // 토큰 만료 시 자동 갱신 시도
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // 토큰 갱신 성공 시 원래 요청 재시도
        return this.request<T>(endpoint, options);
      } else {
        // 토큰 갱신 실패 시 로그아웃
        useAuthStore.getState().logout();
        window.location.href = '/login';
        throw new Error('Authentication failed');
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const { refreshToken } = useAuthStore.getState();
      if (!refreshToken) return false;

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const { accessToken, refreshToken: newRefreshToken } = await response.json();
        useAuthStore.getState().updateTokens(accessToken, newRefreshToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Auth API methods
  async login(username: string, passwd: string) {
    const res = await fetch(`${this.baseURL}/api/v1/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, passwd }),
      credentials: 'include', // 쿠키를 포함하여 요청
    });

    return res.json().then((data) => {
      if(res.status === 200) {
        return {
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        }
      } else {
        throw new Error(data.message || 'Login Failed');
      }
    })
  }

  async signup(email: string, nickname: string, password: string) {
    return this.request<{ message: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, nickname, password }),
    });
  }

  async getProfile() {
    return this.request<{ id: string; email: string; nickname: string }>('/auth/profile');
  }

  // 기존 API methods (JWT 토큰 자동 포함)
  async getMarkets() {
    return this.request<any[]>('/markets');
  }
}

export const apiClient = new ApiClient(URL); 