
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/apiClient';

export const useUser = () => {
  const { user, isAuthenticated } = useAuthStore();

  const handleChangePasswd = async (currentPwd: string, newPwd: string) => {
    const { success, message } = await apiClient.passwdChange(currentPwd, newPwd);

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

  const handleDeleteUser = async () => {
    const { success, message } = await apiClient.deleteUser();

    if (success) {
      return { success, message };
    } else {
      return { success, message };
    }
  }

  const handleBankrupt = async () => {
    const { success, message } = await apiClient.bankrupt();

    if (success) {
      return { success, message };
    } else {
      return { success, message };
    }
  }

  return {
    user,
    isAuthenticated,
    handleChangePasswd,
    handleChangeNickname,
    handleDeleteUser,
    handleBankrupt,
  };
}; 