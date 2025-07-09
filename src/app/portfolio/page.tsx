'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function PortfolioPage() {
  const router = useRouter();

  // 페이지 진입 시 기본 탭인 '보유자산' 경로로 이동
  useEffect(() => {
    if(!useAuthStore.getState().isAuthenticated) {
      // 인증되지 않은 경우 로그인 페이지로 리다이렉트
      router.push('/login');
    } else {
      router.replace('/portfolio/holdings');
    }
  }, []);

  return (
    <main className="grid grid-cols-3 gap-2 min-h-screen p-4 md:p-8 bg-gray-50">
    </main>
  );
}
