import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/apiClient';
import { tokenUtils } from '@/lib/tokenUtils';

export const useAuth = () => {
  const { user, isAuthenticated } = useAuthStore();

  const handleLogin = async (username: string, passwd: string) => {
    try {
      const { success, message, user } = await apiClient.login(username, passwd);
      if (success === 0) {
        tokenUtils.updateTokens(user.accessToken, user.refreshToken);
        return { success: true, message: message };
      } else if (success === 1) {
        return { success: false, message: message };
      } else {
        return { success: false, message: message };
      }
    } catch (error: any) {
      return { success: false, error: error.response.data.message };
    }
  };

  const handleSingup = async (email: string, nickname: string, passwd: string, username: string) => {
    try {
      const result = await apiClient.signup(email, nickname, passwd, username);
      if (result.success) {
        return { success: result.success, message: result.message };
      } else {
        return { success: false, message: result.message };
      }
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
      return { success, message };;
    } else {
      return { success, message };
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