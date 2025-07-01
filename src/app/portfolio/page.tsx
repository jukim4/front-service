'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PortfolioPage() {
  const router = useRouter();

  // 페이지 진입 시 기본 탭인 '보유자산' 경로로 이동
  useEffect(() => {
    router.replace('/portfolio/holdings');
  }, [router]);

  return (
    <main className="grid grid-cols-3 gap-2 min-h-screen p-4 md:p-8 bg-gray-50">
    </main>
  );
}
