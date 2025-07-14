'use client'

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ChunkErrorBoundary extends Component<Props, State> {
  private reloadTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // 에러가 발생하면 hasError 상태를 업데이트
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Chunk 로드 실패 감지
    if (this.isChunkLoadError(error)) {
      console.log('Chunk load error detected, reloading page in 1 second...');
      
      // 1초 후 페이지 새로고침
      this.reloadTimeoutId = setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }

  componentWillUnmount() {
    if (this.reloadTimeoutId) {
      clearTimeout(this.reloadTimeoutId);
    }
  }

  private isChunkLoadError(error: Error): boolean {
    const chunkFailedMessage = /Loading chunk \d+ failed|Loading CSS chunk \d+ failed|ChunkLoadError/;
    return chunkFailedMessage.test(error.message);
  }

  private handleManualReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Chunk 로드 에러인 경우 자동 새로고침 메시지
      if (this.state.error && this.isChunkLoadError(this.state.error)) {
        return (
          <div className="flex flex-col items-center justify-center h-64 p-8 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 text-center mb-4">
              새로운 업데이트를 불러오는 중입니다...
            </p>
            <button
              onClick={this.handleManualReload}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              수동 새로고침
            </button>
          </div>
        );
      }

      // 사용자 정의 fallback이 있는 경우
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 일반 에러인 경우
      return (
        <div className="flex flex-col items-center justify-center h-64 p-8 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-600 text-center mb-4">
            <h2 className="text-lg font-semibold mb-2">오류가 발생했습니다</h2>
            <p className="text-sm">페이지를 새로고침해주세요.</p>
          </div>
          <button
            onClick={this.handleManualReload}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            페이지 새로고침
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChunkErrorBoundary; 