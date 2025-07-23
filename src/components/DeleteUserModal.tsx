import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { useAuthStore } from "@/store/authStore";

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DeleteUserModal({ 
  isOpen, 
  onClose,
  onSuccess,
}: DeleteUserModalProps) {
  const [deleteStep, setDeleteStep] = useState<'confirm' | 'done'>('confirm');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const { handleDeleteUser } = useUser();
  const { setUser, user } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      setDeleteStep('confirm');
      setErrorMessage("");
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setDeleteStep('confirm');
    setErrorMessage("");
    setIsLoading(false);
    onClose();
  };

  const confirmNicknameChange = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await handleDeleteUser();
      
      if (result.success) {
        if (user) {
          setUser({
            ...user,
            nickname: user?.nickname
          });
        }
        setDeleteStep('done');
        
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 1500);
        }
      } else {
        setErrorMessage(result.message || "회원탈퇴에 실패했습니다.");
      }
    } catch (error) {
      setErrorMessage("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
      <div className="bg-white rounded-md shadow-lg p-6 w-[350px] text-center z-50">
        
        {deleteStep === 'confirm' && (
          <>
            <h3 className="text-lg font-semibold mb-4">회원탈퇴</h3>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">정말로 회원탈퇴를 진행하시겠습니까?</p>
              <p className="text-gray-600 mb-4">회원탈퇴 후 데이터는 복구할 수 없으며, 동일한 아이디로 재가입이 불가능합니다.</p>
            </div>
            
            {errorMessage && (
              <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
            )}
            
            <div className="flex justify-center gap-3">
              <button
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                disabled={isLoading}
              >
                취소
              </button>
              <button
                onClick={confirmNicknameChange}
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                disabled={isLoading}
              >
                {isLoading ? "회원탈퇴 중..." : "회원탈퇴"}
              </button>
            </div>
          </>
        )}

        {deleteStep === 'done' && (
          <>
            <div className="text-green-500 text-4xl mb-4">✓</div>
            <h3 className="text-lg font-semibold mb-2">회원탈퇴 완료</h3>
            <p className="text-blue-600 mb-4">회원탈퇴가 완료되었습니다. <br />3초 후에 메인 페이지로 이동합니다.</p>
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              확인
            </button>
          </>
        )}
        
      </div>
    </div>
  );
}