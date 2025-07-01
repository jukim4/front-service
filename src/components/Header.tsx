'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';

import { apiClient } from '@/lib/apiClient';


export default function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();
  
  // 로그인 상태 확인용 state
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    apiClient.checkAuth()

    const interval = setInterval(() => {
      apiClient.checkAuth();
    }, 3600000); // 1시간마다 인증 유효성 검사
  }, []);

  return (
    <nav className="border-b bg-blue-900 text-white fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 왼쪽 */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold hover:text-gray-300">
              CoWing
            </Link>
            <Link href="/exchange" className="hover:text-gray-300">
              모의거래소
            </Link>
            <Link href="/investments" className="hover:text-gray-300">
              투자내역
            </Link>
            <Link href="/portfolio" className="hover:text-gray-300">
              포트폴리오
            </Link>
          </div>

          {/* 오른쪽 */}
          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <span className="text-sm">
                  {user?.nickname}님 환영합니다
                </span>
                <button
                  onClick={logout}
                  className="text-sm hover:text-red-800"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                {/* 비로그인 상태일 때 */}
                <Link href="/login" className="hover:text-gray-300">
                  로그인
                </Link>
                <Link href="/signup" className="hover:text-gray-300">
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
