'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

import { useAuthStore } from '@/store/authStore';

type SignupFormProps = {
  onSwitch?: () => void;
};

export default function SignupForm({ onSwitch }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUserName] = useState('');
  const [nickname, setNickName] = useState('');
  const { handleSingup } = useAuth(); // Assuming useAuth hook is available

  const setUser = useAuthStore((state) => state.setUser);
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await handleSingup(email, nickname, password, username);
      if (result.success) {
        // 임시 user 정보 저장
        setUser({ email, nickname, username})
        alert(result.message);
      } else {
        alert(result.message);
      }
      
    } catch (err: any) {
      alert('회원가입 실패: ' + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-96">
      <h2 className="text-2xl font-bold text-left">회원가입</h2>
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="이름을 입력해주세요"
          value={username}
          onChange={(e) => setUserName(e.target.value)}
          required
          className="p-2 border rounded flex-1 w-full"
        />
        <input
          type="text"
          placeholder="닉네임을 입력해주세요"
          value={nickname}
          onChange={(e) => setNickName(e.target.value)}
          required
          className="p-2 border rounded flex-1 w-full"
        />
      </div>
      <input
        type="email"
        placeholder="이메일 주소를 입력해주세요"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="p-2 border rounded"
      />
      <input
        type="password"
        placeholder="비밀번호를 입력해주세요"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="p-2 border rounded"
      />
      <button
        type="submit"
        className="bg-blue-900 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        회원가입
      </button>
      {onSwitch && (
        <p
          onClick={onSwitch}
          className="text-sm text-center text-blue-600 hover:underline cursor-pointer"
        >
          이미 계정이 있으신가요? 로그인
        </p>
      )}
    </form>
  );
}
