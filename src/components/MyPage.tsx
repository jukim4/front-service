'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import { useAuthStore } from '@/store/authStore';
import ChangeNicknameModal from './ChangeNicknameModal';
import DeleteUserModal from './DeleteUserModal';

export default function MyPage() {
    const [bankruptcyStep, setBankruptcyStep] = useState<'none' | 'confirm' | 'done'>('none');
    const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
    const [nicknameInput, setNicknameInput] = useState(''); // 닉네임 입력 상태
    const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
    const { user } = useAuthStore();

    // 컴포넌트 마운트 시 현재 닉네임을 입력창에 설정
    useEffect(() => {
        if (user?.nickname) {
            setNicknameInput(user.nickname);
        }
    }, [user?.nickname]);

    const openBankruptcyModal = () => setBankruptcyStep('confirm');
    const closeBankruptcyModal = () => setBankruptcyStep('none');
    const confirmBankruptcy = () => setBankruptcyStep('done');
    const finalizeBankruptcy = () => setBankruptcyStep('none');

    // 닉네임 변경 모달 열기
    const handleNicknameChange = () => {
        if (!nicknameInput.trim()) {
            alert('닉네임을 입력해주세요.');
            return;
        }
        
        if (nicknameInput.trim() === user?.nickname) {
            alert('현재 닉네임과 동일합니다.');
            return;
        }
        
        setIsNicknameModalOpen(true);
    };

    // 닉네임 변경 성공 시 입력창 업데이트
    const handleNicknameChangeSuccess = () => {
        setIsNicknameModalOpen(false);
        // 모달에서 이미 전역 상태를 업데이트하므로 추가 작업 불필요
    };

    const handleDeleteUserSuccess = () => {
        setIsDeleteUserModalOpen(false);
        // 모달에서 이미 전역 상태를 업데이트하므로 추가 작업 불필요
    };

    return (
        <div className="min-h-[90vh] bg-gray-100 p-10">
            <div className="max-w-5xl mx-auto bg-white p-10 rounded-md shadow-md flex flex-col gap-10">

                {/* 오른쪽 */}
                <div className="w-full space-y-6">

                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">기본 정보</h2>
                        <div>
                            <label className="block text-sm font-medium">닉네임</label>
                            <input
                                type="text"
                                value={nicknameInput}
                                onChange={(e) => setNicknameInput(e.target.value)}
                                placeholder="닉네임"
                                className="mt-1 w-full border px-3 py-2 rounded text-sm"
                                maxLength={20}
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                현재 저장된 닉네임: {user?.nickname || '없음'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">이메일</label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="mt-1 w-full border px-3 py-2 rounded bg-gray-100 text-sm"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                이메일은 수정할 수 없습니다.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-x-2">
                        <button
                            onClick={() => setIsDeleteUserModalOpen(true)}
                            className="px-4 py-2 border border-red-500 text-red-600 rounded hover:bg-red-100 text-sm"
                        >
                            회원 탈퇴
                        </button>
                        <button className="px-4 py-2 border border-blue-500 text-blue-600 rounded hover:bg-blue-100 text-sm">
                            <Link href="/password">
                                비밀번호 변경
                            </Link>
                        </button>
                        <button
                            onClick={openBankruptcyModal}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
                        >
                            파산 신청
                        </button>
                        <button
                            onClick={handleNicknameChange}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
                            disabled={!nicknameInput.trim()}
                        >
                            변경사항 저장
                        </button>
                    </div>
                </div>
            </div>

            {/* 파산 신청 모달 */}
            {bankruptcyStep !== 'none' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
                    <div className="bg-white rounded-md shadow-lg p-6 w-[300px] text-center z-50">
                        {bankruptcyStep === 'confirm' && (
                            <>
                                <p className="text-lg font-semibold mb-6">
                                    정말 파산하시겠습니까?
                                </p>
                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={closeBankruptcyModal}
                                        className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={confirmBankruptcy}
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        파산 신청
                                    </button>
                                </div>
                            </>
                        )}

                        {bankruptcyStep === 'done' && (
                            <>
                                <p className="text-lg font-semibold mb-6">파산되었습니다</p>
                                <button
                                    onClick={finalizeBankruptcy}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    확인
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* 회원탈퇴 모달 */}
            <DeleteUserModal
                isOpen={isDeleteUserModalOpen}
                onClose={() => setIsDeleteUserModalOpen(false)}
                onSuccess={handleDeleteUserSuccess}
            />

            {/* 닉네임 변경 모달 */}
            <ChangeNicknameModal
                isOpen={isNicknameModalOpen}
                onClose={() => setIsNicknameModalOpen(false)}
                onSuccess={handleNicknameChangeSuccess}
                currentNickname={user?.nickname || ''}
                newNickname={nicknameInput.trim()}
            />
        </div>
    );
}
