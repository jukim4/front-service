import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/apiClient';
import { tokenUtils } from '@/lib/tokenUtils';

export const useAuth = () => {
  const { user, isAuthenticated } = useAuthStore();

  const handleLogin = async (username: string, passwd: string) => {
    try {
      const { user, accessToken, refreshToken } = await apiClient.login(username, passwd);
      // login(user, accessToken, refreshToken);
      tokenUtils.updateTokens(accessToken, refreshToken);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.response.data.message };
    }
  };

  const handleSingup = async (email: string, nickname: string, passwd: string, username: string) => {
    try {
      await apiClient.signup(email, nickname, passwd, username);
      return { success: true, message: '회원가입 성공' };
    } catch (error: any) {
      return { success: false, error: error.message || '회원가입 실패' };
    }
  };

  const handleLogout = async () => {
    await apiClient.logout();
    window.location.href = '/login';
  };

  const handleChangePasswd = async (email: string, currentPwd: string, newPwd: string) => {
    const { success, message } = await apiClient.passwdChange(email, currentPwd, newPwd);

    if (success) {
      alert(message);
      window.location.href = '/mypage';
    } else {
      alert(message);
    }
  };

  return {
    user,
    isAuthenticated,
    login: handleLogin,
    logout: handleLogout,
    handleChangePasswd,
    handleSingup,
  };
}; 