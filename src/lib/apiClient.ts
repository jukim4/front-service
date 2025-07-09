import { useAuthStore } from '@/store/authStore';
import { tokenUtils } from './tokenUtils';

const URL = process.env.NEXT_PUBLIC_URL || 'http://localhost';

class ApiClient {
  private baseURL: string = URL;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // token 유효성 검증
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
        credentials: 'include',
      });

      if (res.status === 200) {
        res.json().then((data) => {
          tokenUtils.updateTokens(data.accessToken, data.refreshToken);
        });

        return true;
      } else {
        console.error('Failed to refresh access token');
        useAuthStore.setState({ isAuthenticated: false });
        // 토큰 갱신 실패 시 로그아웃 처리
        this.logout();
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

  // 로그아웃
  async logout() {
    const ref = await fetch(`${this.baseURL}/api/v1/logout`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenUtils.returnTokens().accessToken}` // 현재 accessToken 사용 
       },
       credentials: 'include',
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

  // 비밀번호 변경
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

  // 회원가입
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

  // 시장가 매수
  async orderMarket(coin_ticker: string, position: string, total: number, market_code: string) {
    const token = tokenUtils.returnTokens().accessToken
    try {

      if(position === "buy") {
        
          const res = await fetch(`${this.baseURL}/api/v1/orders/market/${position}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ coin_ticker, position, total_price: total, market_code }),
            credentials: 'include',
          });

          if (res.status === 200) {
            return {message: "주문이 성공하였습니다!", success: true};
          } else {
            return {message: "주문이 실패하였습니다", success: false};
          }

      } else {
        const res = await fetch(`${this.baseURL}/api/v1/orders/market/${position}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ coin_ticker, position, total_quantity: total, market_code }),
            credentials: 'include',
          });

          if (res.status === 200) {
            return {message: "주문이 성공하였습니다!", success: true};
          } else {
            return {message: "주문이 실패하였습니다", success: false};
          }
      }
   
      } catch (err) {
        console.error("API Error: ", err);
        throw err;
      }
  }

  // 지정가 매수
  async orderLimit(market_code: string, coin_ticker: string, order_price: number, position: string, order_quantity: number, total_order_price: number) {
    const token = tokenUtils.returnTokens().accessToken;
    try {
      const res = await fetch(`${this.baseURL}/api/v1/orders/limit`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ market_code, coin_ticker, position, order_price, order_quantity, total_order_price}),
        credentials: 'include',
      });

      if (res.status === 200) {
        return {message: "주문이 성공하였습니다!", success: true};
      } else {
        return {message: "주문이 실패하였습니다", success: false};
      }
    } catch(err) {
      console.error("API Error: ", err);
      throw err;
    }
  }

  // user holdings
  async userInfo() {
    const token = tokenUtils.returnTokens().accessToken;
    try {
  const res = await fetch(`${this.baseURL}/api/v1/asset`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await res.json(); // await 사용

  if (res.status === 200) {
    return data;
  } else {
    throw new Error(data.message || 'Request failed');
  }
} catch (err) {
  console.error('API Error:', err);
  throw err; // 상위로 에러 전달
}
  }

  // 포트폴리오
  async userPorfolio() {
    const token = tokenUtils.returnTokens().accessToken;
    try {
      const res = await fetch(`${this.baseURL}/api/v1/portfolio`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if(res.status === 200) {
        return data.data;
      } else {
        throw new Error(data.message || 'Request failed');
      }
    } catch(err) {
      console.error('API Error', err);
      throw err;
    }
  }

  // 거래내역
  async tradeHistory() {
    const token = tokenUtils.returnTokens().accessToken;
    try {
      const res = await fetch(`${this.baseURL}/api/v1/histories/trades`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.status === 200) {
        if (data) {
          return data;
        } else {
          return 0;
        }
      } else {
        throw new Error(data.message || 'Request failed');
      }
    } catch(err) {
      console.error('API Error', err);
      throw err;
    }
  }
}

export const apiClient = new ApiClient(URL);
