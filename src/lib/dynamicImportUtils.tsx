import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: Error, attempt: number) => void;
}

/**
 * 재시도 로직을 포함한 dynamic import 래퍼
 * @param importFunction - 동적으로 로드할 컴포넌트의 import 함수
 * @param options - 재시도 옵션
 * @returns dynamic 컴포넌트
 */
export function createRetryableDynamicImport<T extends ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>,
  options: RetryOptions = {}
) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onError
  } = options;

  const retryableImport = async (): Promise<{ default: T }> => {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await importFunction();
      } catch (error) {
        lastError = error as Error;
        
        // 에러 콜백 호출
        if (onError) {
          onError(lastError, attempt);
        }

        // Chunk 로드 에러인지 확인
        const isChunkError = /Loading chunk \d+ failed|Loading CSS chunk \d+ failed|ChunkLoadError/.test(lastError.message);
        
        if (isChunkError && attempt < maxRetries) {
          console.log(`Chunk load failed (attempt ${attempt}/${maxRetries}), retrying in ${retryDelay}ms...`);
          
          // 재시도 전 대기
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        } else if (attempt === maxRetries) {
          console.error(`Failed to load chunk after ${maxRetries} attempts:`, lastError);
          throw lastError;
        } else {
          // Chunk 에러가 아닌 경우 즉시 에러 throw
          throw lastError;
        }
      }
    }
    
    throw lastError!;
  };

  return retryableImport;
}

/**
 * 기본 설정으로 재시도 가능한 dynamic 컴포넌트 생성
 * @param importFunction - 동적으로 로드할 컴포넌트의 import 함수
 * @param dynamicOptions - Next.js dynamic 옵션
 * @returns dynamic 컴포넌트
 */
export function createDynamicComponentWithRetry<T extends ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>,
  dynamicOptions: any = {}
) {
  const retryableImport = createRetryableDynamicImport(importFunction, {
    maxRetries: 3,
    retryDelay: 1000,
    onError: (error, attempt) => {
      console.warn(`Dynamic import attempt ${attempt} failed:`, error.message);
    }
  });

  return dynamic(retryableImport, {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    ),
    ...dynamicOptions
  });
}

/**
 * 사용자 정의 옵션으로 재시도 가능한 dynamic 컴포넌트 생성
 */
export function createAdvancedDynamicComponent<T extends ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>,
  retryOptions: RetryOptions = {},
  dynamicOptions: any = {}
) {
  const retryableImport = createRetryableDynamicImport(importFunction, retryOptions);

  return dynamic(retryableImport, {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    ),
    ...dynamicOptions
  });
} 