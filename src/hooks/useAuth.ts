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

  const handleLogout = async () => {
    await apiClient.logout();
    window.location.href = '/login';
  };

  return {
    user,
    isAuthenticated,
    login: handleLogin,
    logout: handleLogout,
  };
}; 