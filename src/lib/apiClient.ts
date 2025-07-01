import { useAuthStore } from '@/store/authStore';
import { tokenUtils } from './tokenUtils';

const URL = process.env.NEXT_PUBLIC_URL || 'http://localhost';

class ApiClient {
  private baseURL: string = URL;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }


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
      localStorage.clear(); // 토큰 초기화
      useAuthStore.setState({ isAuthenticated: false });
      window.location.href = '/';
    } else {
      const errorData = await ref.json();
      throw new Error(errorData.message || 'Logout Failed');
    }
  }

  async passwdChange(email: string, currentPwd: string, newPwd: string) {
    const res = await fetch(`${this.baseURL}/api/v1/change/passwd`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, currentPwd, newPwd }),
    });

    if (res.status === 200) {
      return { success: true, message: 'Password changed successfully' };
    }
    else {
      const errorData = await res.json();
      return { success: false, message: errorData.message || 'Password change failed' };
    }
  }

  async signup(email: string, nickname: string, passwd: string, username: string) {
    const res = await fetch(`${this.baseURL}/api/v1/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, nickname, passwd, username }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error);
    }

    window.location.href = '/login';
  }
}

export const apiClient = new ApiClient(URL);
