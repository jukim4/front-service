import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

/**
 * Chunk 에러 발생 시 자동 새로고침하는 dynamic import 래퍼
 */
function createChunkErrorHandler<T extends ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>
) {
  return async (): Promise<{ default: T }> => {
    try {
      return await importFunction();
    } catch (error) {
      const loadError = error as Error;
      
      // Chunk 로드 에러인지 확인
      const isChunkError = /Loading chunk \d+ failed|ChunkLoadError/i.test(loadError.message);
      
      if (isChunkError) {
        console.log('Chunk load failed, refreshing page...');
        
        // 자동 새로고침
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
        
        // 새로고침 후 무한 대기
        return new Promise(() => {});
      }
      
      // Chunk 에러가 아닌 경우 에러 throw
      throw loadError;
    }
  };
}

/**
 * Chunk 에러 시 자동 새로고침하는 dynamic 컴포넌트 생성
 */
export function createDynamicComponentWithRetry<T extends ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>,
  dynamicOptions: any = {}
) {
  const chunkErrorHandler = createChunkErrorHandler(importFunction);

  return dynamic(chunkErrorHandler, {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    ),
    ...dynamicOptions
  });
} 