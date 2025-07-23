import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { useAuthStore } from "@/store/authStore";

interface BankruptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BankruptModal({ 
  isOpen, 
  onClose,
  onSuccess,
}: BankruptModalProps) {
  const [bankruptStep, setBankruptStep] = useState<'confirm' | 'done'>('confirm');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const { handleBankrupt } = useUser();
  const { user } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      setBankruptStep('confirm');
      setErrorMessage("");
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setBankruptStep('confirm');
    setErrorMessage("");
    setIsLoading(false);
    onClose();
  };

  const confirmBankrupt = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await handleBankrupt();
      
      if (result.success) {
        setBankruptStep('done');
        
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 1500);
        }
      } else {
        setErrorMessage(result.message || "파산 신청에 실패했습니다.");
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
        
        {bankruptStep === 'confirm' && (
          <>
            <h3 className="text-lg font-semibold mb-4">파산 신청</h3>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">정말로 파산하시겠습니까?</p>
              <p className="text-gray-600 mb-4">파산 신청 시 모든 보유 종목이 청산되고, <br />원화 자산이 1000만원으로 초기화됩니다.</p>
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
                onClick={confirmBankrupt}
                className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300"
                disabled={isLoading}
              >
                {isLoading ? "파산 신청 중..." : "파산 신청"}
              </button>
            </div>
          </>
        )}

        {bankruptStep === 'done' && (
          <>
            <div className="text-green-500 text-4xl mb-4">✓</div>
            <h3 className="text-lg font-semibold mb-2">파산 신청 완료</h3>
            <p className="text-blue-600 mb-4">파산 신청이 완료되었습니다. <br />원화 자산이 1000만원으로 초기화되었습니다.</p>
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