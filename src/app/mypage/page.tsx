'use client';

import MyPage from '@/components/MyPage';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function MyPageScreen() {
  const router = useRouter();
  useEffect(() => {
    if(!useAuthStore.getState().isAuthenticated) {
      // 인증되지 않은 경우 로그인 페이지로 리다이렉트
      router.push('/login');
    } else {
      router.replace('/mypage');
    }
  }, []);

  return <MyPage />;
}