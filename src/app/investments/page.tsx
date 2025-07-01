'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InvestmentsPage() {
  const router = useRouter();

  // URL parameter에서 초기 탭 설정
  useEffect(() => {
    router.push('/investments/transaction-history');
  }, []);

  return (
    <main className="grid grid-cols-3 gap-2 min-h-screen p-4 md:p-8 bg-gray-50">
    </main>
  );
}
