import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

/**
 * 단순한 dynamic import 헬퍼
 */
export function createDynamicComponent<T extends ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>,
  dynamicOptions: any = {}
) {
  return dynamic(importFunction, {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    ),
    ...dynamicOptions
  });
} 