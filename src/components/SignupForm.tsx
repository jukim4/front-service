'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';

type SignupFormProps = {
  onSwitch?: () => void;
};

// 비밀번호 유효성 검사 함수
const validatePassword = (password: string) => {
  const rules = {
    length: password.length >= 8 && password.length <= 16,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };

  const isValid = Object.values(rules).every(rule => rule);
  
  return { rules, isValid };
};

export default function SignupForm({ onSwitch }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUserName] = useState('');
  const [nickname, setNickName] = useState('');
  const { handleSingup } = useAuth(); // Assuming useAuth hook is available

  const [ checkSignup, setCheckSignup ] = useState(false); // 회원가입 가능 여부
  const [ signupInfo, setSignupInfo ] = useState<string | undefined>();
  
  // 비밀번호 검증 결과
  const passwordValidation = useMemo(() => validatePassword(password), [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 비밀번호 유효성 검사
    if (!passwordValidation.isValid) {
      setCheckSignup(true);
      setSignupInfo('비밀번호가 규칙을 만족하지 않습니다.');
      return;
    }

    try {
      const result = await handleSingup(email, nickname, password, username);
      if (result.success) {

      } else {
        setCheckSignup(true);
        setSignupInfo(result.message);
      }   
    } catch (err: any) {
      console.error('회원가입 실패: ' + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-96">
      <h2 className="text-2xl font-bold text-left">회원가입</h2>
      <p className="text-xs text-gray-600">사용자 이름은 로그인 시 아이디로 사용됩니다.</p>
      <input
        type="text"
        placeholder="사용자 이름을 입력해주세요"
        value={username}
        onChange={(e) => setUserName(e.target.value)}
        required
        className="p-2 border rounded"
      />
      <input
        type="text"
        placeholder="닉네임을 입력해주세요"
        value={nickname}
        onChange={(e) => setNickName(e.target.value)}
        required
        className="p-2 border rounded"
      />
      <input
        type="email"
        placeholder="이메일 주소를 입력해주세요"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="p-2 border rounded"
      />
      <div className="flex flex-col gap-4">
        <input
          type="password"
          placeholder="비밀번호를 입력해주세요"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={`p-2 border rounded ${password && !passwordValidation.isValid ? 'border-red-500' : ''}`}
        />
        
        {/* 비밀번호 규칙 안내 */}
        <div className="text-xs text-gray-600 flex flex-col">
          <p className="font-medium">아래 규칙을 준수해 비밀번호를 생성해 주세요.</p>
          <ul className="list-none space-y-1 mt-1">
            <li className={`flex items-center gap-1 ${passwordValidation.rules.length ? 'text-green-600' : 'text-red-500'}`}>
              <span>{passwordValidation.rules.length ? '✓' : '✗'}</span>
              8~16자
            </li>
            <li className={`flex items-center gap-1 ${passwordValidation.rules.uppercase ? 'text-green-600' : 'text-red-500'}`}>
              <span>{passwordValidation.rules.uppercase ? '✓' : '✗'}</span>
              영문 대문자 포함
            </li>
            <li className={`flex items-center gap-1 ${passwordValidation.rules.lowercase ? 'text-green-600' : 'text-red-500'}`}>
              <span>{passwordValidation.rules.lowercase ? '✓' : '✗'}</span>
              영문 소문자 포함
            </li>
            <li className={`flex items-center gap-1 ${passwordValidation.rules.number ? 'text-green-600' : 'text-red-500'}`}>
              <span>{passwordValidation.rules.number ? '✓' : '✗'}</span>
              숫자 포함
            </li>
            <li className={`flex items-center gap-1 ${passwordValidation.rules.special ? 'text-green-600' : 'text-red-500'}`}>
              <span>{passwordValidation.rules.special ? '✓' : '✗'}</span>
              특수문자 포함
            </li>
          </ul>
        </div>
      </div>
      
      <button
        type="submit"
        disabled={!passwordValidation.isValid}
        className={`text-white py-2 rounded transition ${
          passwordValidation.isValid 
            ? 'bg-blue-900 hover:bg-blue-700' 
            : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        회원가입
      </button>
      {checkSignup &&
        <p className='text-sm text-center text-red-500'>{signupInfo}</p>
      }
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
