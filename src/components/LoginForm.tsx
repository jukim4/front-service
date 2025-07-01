'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

type LoginFormProps = {
  onSwitch?: () => void;
};

export default function LoginForm({ onSwitch }: LoginFormProps) {
  const [username, setUserName] = useState('');
  const [passwd, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    const URL = process.env.NEXT_PUBLIC_URL;

    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${URL}/api/v1/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({username, passwd}),
      });

      if(res.status === 200) {
        useAuthStore.setState({isAuthenticated: true});
        useEffect(() => {
          console.log(isAuthenticated);
        }, [isAuthenticated]);
        router.push('/');
      }else {
        alert("로그인 실패: ");
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
