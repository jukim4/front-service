import { useAuthStore } from "@/store/authStore";

export const tokenUtils = {

    // localstorage에 토큰 저장 함수
    updateTokens: (accessToken: string | null, refreshToken: string | null) => {
      localStorage.setItem('accessToken', accessToken ?? '');
      localStorage.setItem('refreshToken', refreshToken ?? '');
    },
    
    // localstorage에서 토큰 반환 함수
    returnTokens: () => {
      return (
        {'accessToken': localStorage.getItem('accessToken'),
         'refreshToken': localStorage.getItem('refreshToken')}
      )
    },
    
    // 토큰 유효성 검사 함수(기간)
    isTokenValie: () => {
      const token = tokenUtils.returnTokens().accessToken;
      if (!token) return false;
    
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        return !isExpired;
      } catch (error) {
        return false;
      }
    },
}