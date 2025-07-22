import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { useAuthStore } from "@/store/authStore";

interface ChangeNicknameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  currentNickname?: string;
  newNickname: string;
}

export default function ChangeNicknameModal({ 
  isOpen, 
  onClose,
  onSuccess,
  currentNickname = "",
  newNickname
}: ChangeNicknameModalProps) {
  const [nicknameStep, setNicknameStep] = useState<'confirm' | 'done'>('confirm');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const { handleChangeNickname } = useUser();
  const { setUser, user } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      setNicknameStep('confirm');
      setErrorMessage("");
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setNicknameStep('confirm');
    setErrorMessage("");
    setIsLoading(false);
    onClose();
  };

  const confirmNicknameChange = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await handleChangeNickname(newNickname);
      
      if (result.success) {
        if (user) {
          setUser({
            ...user,
            nickname: newNickname
          });
        }
        setNicknameStep('done');
        
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 1500);
        }
      } else {
        setErrorMessage(result.message || "닉네임 변경에 실패했습니다.");
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
        
        {nicknameStep === 'confirm' && (
          <>
            <h3 className="text-lg font-semibold mb-4">닉네임 변경 확인</h3>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">다음과 같이 변경하시겠습니까?</p>
              <div className="bg-gray-50 p-4 rounded text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">현재:</span>
                  <span className="font-medium">{currentNickname}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">변경:</span>
                  <span className="font-medium text-blue-600">{newNickname}</span>
                </div>
              </div>
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
                {isLoading ? "변경 중..." : "변경하기"}
              </button>
            </div>
          </>
        )}

        {nicknameStep === 'done' && (
          <>
            <div className="text-green-500 text-4xl mb-4">✓</div>
            <h3 className="text-lg font-semibold mb-2">변경 완료</h3>
            <p className="text-gray-600 mb-6">
              닉네임이{' '}
              <span className="font-medium text-blue-600">
                &quot;{newNickname}&quot;
              </span>
              로 변경되었습니다.
            </p>
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