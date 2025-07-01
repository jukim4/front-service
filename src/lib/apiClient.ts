import { useAuthStore } from '@/store/authStore';
import { tokenUtils } from './tokenUtils';

const URL = process.env.NEXT_PUBLIC_URL || 'http://localhost';

class ApiClient {
  private baseURL: string = URL;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // private async request<T>(
  //   endpoint: string,
  //   options: RequestInit = {}
  // ): Promise<T> {
  //   const { accessToken } = useAuthStore.getState();
    
  //   const config: RequestInit = {
  //     headers: {
  //       'Content-Type': 'application/json',
  //       ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
  //       ...options.headers,
  //     },
  //     ...options,
  //   };

  //   const response = await fetch(`${this.baseURL}${endpoint}`, config);

  //   if (response.status === 401) {
  //     // 토큰 만료 시 자동 갱신 시도
  //     const refreshed = await this.refreshToken();
  //     if (refreshed) {
  //       // 토큰 갱신 성공 시 원래 요청 재시도
  //       return this.request<T>(endpoint, options);
  //     } else {
  //       // 토큰 갱신 실패 시 로그아웃
  //       useAuthStore.getState().logout();
  //       window.location.href = '/login';
  //       throw new Error('Authentication failed');
  //     }
  //   }

  //   if (!response.ok) {
  //     throw new Error(`HTTP error! status: ${response.status}`);
  //   }

  //   return response.json();
  // }

  async checkAuth() {
    const { accessToken, refreshToken } = tokenUtils.returnTokens();
    const isValid = tokenUtils.isTokenValie();
    if (!accessToken) {
      useAuthStore.setState({ isAuthenticated: false });
      return;

    } else if (!isValid) {
      console.error("AccessToken is not valid");
      if(!refreshToken) {
        useAuthStore.setState({ isAuthenticated: false });
        return;
      }
      this.refreshToken();
      window.location.href = '/login';
    }
    useAuthStore.setState({ isAuthenticated: !accessToken ? false: true });

  }

  // accessToken 갱신 함수
  private async refreshToken(): Promise<boolean> {
    try {
      const refresh = tokenUtils.returnTokens().refreshToken;
      if (!refresh) {
        console.error('RefreshToken is not available');
        return false;
      }

      const res = await fetch(`${this.baseURL}/api/v1/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${refresh}`},
      });

      if (res.status === 200) {
        const updateTokens = tokenUtils.updateTokens;
        const data= await res.json();
        updateTokens(data.accessToken, data.refreshToken);

        return true;
      } else {
        console.error('Failed to refresh access token');
        useAuthStore.setState({ isAuthenticated: false });
        // 토큰 갱신 실패 시 로그아웃 처리


        window.location.href = '/login';
        return false;
      }
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
        useAuthStore.setState({isAuthenticated: true});
        return {
          user: null,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        }
      } else {
        throw new Error(data.message || 'Login Failed');
      }
    })
  }

  async logout() {
    const ref = await fetch(`${this.baseURL}/api/v1/logout`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenUtils.returnTokens().accessToken}` // 현재 accessToken 사용 
       },
    });

    if (ref.status === 200) {
      tokenUtils.updateTokens(null, null); // 토큰 초기화
      useAuthStore.setState({ isAuthenticated: false });
      window.location.href = '/';
    } else {
      const errorData = await ref.json();
      throw new Error(errorData.message || 'Logout Failed');
    }
  }
}

export const apiClient = new ApiClient(URL);