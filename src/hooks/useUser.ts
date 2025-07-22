
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/apiClient';
import { tokenUtils } from '@/lib/tokenUtils';

export const useUser = () => {
  const { user, isAuthenticated } = useAuthStore();

  const handleChangePasswd = async (email: string, currentPwd: string, newPwd: string) => {
    const { success, message } = await apiClient.passwdChange(email, currentPwd, newPwd);

    if (success) {
      return { success, message };
    } else {
      return { success, message };
    }
  };

  const handleChangeNickname = async (nickname: string) => {
    const { success, message } = await apiClient.changeNickname(nickname);

    if (success) {
      return { success, message };
    } else {
      return { success, message };
    }
  };

  return {
    user,
    isAuthenticated,
    handleChangePasswd,
    handleChangeNickname,
  };
}; 