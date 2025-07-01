'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

type LoginFormProps = {
  onSwitch?: () => void;
};

export default function LoginForm({ onSwitch }: LoginFormProps) {
  const [username, setUserName] = useState('');
  const [passwd, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(username, passwd);
      if (result.success) {
        router.push('/'); // 메인 페이지로 리다이렉트
      } else {
        alert('로그인 실패: ' + result.error);
      }
    } catch (err: any) {
      alert('로그인 실패: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-left">로그인</h2>
      <input
        type="text"
        placeholder="이름을 입력해주세요"
        value={username}
        onChange={(e) => setUserName(e.target.value)}
        required
        disabled={isLoading}
        className="p-2 border rounded w-96"
      />
      <input
        type="password"
        placeholder="비밀번호를 입력해주세요"
        value={passwd}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={isLoading}
        className="p-2 border rounded w-96"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="bg-blue-900 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
      >
        {isLoading ? '로그인 중...' : '로그인'}
      </button>
      {onSwitch && (
        <p
          onClick={onSwitch}
          className="text-sm text-center text-blue-600 hover:underline cursor-pointer"
        >
          계정이 없으신가요? 회원가입
        </p>
      )}
    </form>
  );
}
