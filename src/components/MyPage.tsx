'use client';

import { useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import Link from 'next/link';

export default function MyPage() {
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [bankruptcyStep, setBankruptcyStep] = useState<'none' | 'confirm' | 'done'>('none');

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.size <= 1024 * 1024) {
            setSelectedFile(file);
            const previewUrl = URL.createObjectURL(file);
            setPreview(previewUrl);
            await uploadImage(file);
        } else {
            alert('1MB 이하의 이미지만 업로드할 수 있습니다.');
        }
    };

    const uploadImage = async (file: File) => {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await axios.post('/api/upload-profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const uploadedUrl = res.data.url;
            setPreview(uploadedUrl);
        } catch (err) {
            console.error(err);
            alert('이미지 업로드 실패');
        }
    };

    const triggerFileInput = () => {
        document.getElementById('profile-upload')?.click();
    };

    const openBankruptcyModal = () => setBankruptcyStep('confirm');
    const closeBankruptcyModal = () => setBankruptcyStep('none');
    const confirmBankruptcy = () => setBankruptcyStep('done');
    const finalizeBankruptcy = () => setBankruptcyStep('none');

    return (
        <div className="min-h-[90vh] bg-gray-100 p-10">
            <div className="max-w-5xl mx-auto bg-white p-10 rounded-md shadow-md flex flex-col md:flex-row gap-10">
                {/* 왼쪽 */}
                <div className="flex flex-col items-center text-center w-full md:w-1/3 border-r border-gray-200 pr-6">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center mb-4">
                        {preview ? (
                            <Image
                                src={preview}
                                alt="profile"
                                width={128}
                                height={128}
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <Image
                                src="/default-profile.png"
                                alt="default profile"
                                width={128}
                                height={128}
                                className="object-cover w-full h-full"
                            />
                        )}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                        최대 1MB까지 업로드 가능합니다.<br />
                        회원 이미지는 원형으로 출력됩니다.
                    </p>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        id="profile-upload"
                        className="hidden"
                    />
                    <button
                        onClick={triggerFileInput}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
                    >
                        프로필 사진 업로드
                    </button>
                    <button className="text-sm text-blue-700 underline mt-3">
                        <Link href="/password">
                        비밀번호변경
                        </Link>
                    </button>
                </div>

                {/* 오른쪽 */}
                <div className="w-full md:w-2/3 space-y-6">

                    <div className="flex justify-end gap-x-2">
                        <button
                            onClick={openBankruptcyModal}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
                        >
                            파산 신청
                        </button>
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
                        >
                            확인
                        </button>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">기본 정보</h2>
                        <div>
                            <label className="block text-sm font-medium">이름</label>
                            <input
                                type="text"
                                placeholder="닉네임"
                                className="mt-1 w-full border px-3 py-2 rounded text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">이메일</label>
                            <input
                                type="email"
                                value="1234@gmail.com"
                                disabled
                                className="mt-1 w-full border px-3 py-2 rounded bg-gray-100 text-sm"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                이메일은 수정할 수 없습니다.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-lg font-semibold">언어 설정</h2>
                        <div className="relative">
                            <select className="appearance-none w-full border border-gray-300 px-3 py-2 rounded text-sm bg-white pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400">
                                <option className="text-sm">한국어</option>
                                <option className="text-sm">English</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400 text-xs">
                                🔽
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t">
                        <h2 className="text-lg font-semibold mb-3">회원 탈퇴</h2>
                        <button className="px-4 py-2 border border-red-500 text-red-600 rounded hover:bg-red-100 text-sm">
                            회원탈퇴
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
        </div>
    );
}
