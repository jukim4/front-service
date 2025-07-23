# 코윙 (Cowing) - 코인 모의투자 서비스 프론트엔드

> 실제 시장처럼, 리스크 없이 — 지금 모의투자를 시작해보세요.

코윙은 실제 암호화폐 시장과 유사한 환경에서 가상 자산으로 투자를 시뮬레이션할 수 있는 모의투자 플랫폼입니다. 경제적 손실 없이 리스크 관리 등 투자 경험을 쌓을 수 있습니다.

## 🚀 주요 기능

### 📈 실시간 거래
- **실시간 시세 조회**: Upbit API를 통한 실시간 암호화폐 시세 제공
- **모의 거래**: 지정가/시장가 매수/매도 주문 시뮬레이션
- **실시간 차트**: 캔들스틱 차트와 다양한 기술적 분석 도구

### 💰 포트폴리오 관리
- **보유 종목**: 현재 보유한 가상 자산 현황
- **수익/손실 분석**: 실시간 손익 계산 및 차트 시각화
- **거래 내역**: 완료된 거래 기록 조회
- **대기 주문**: 미체결 주문 관리

### 👤 사용자 관리
- **회원가입/로그인**: JWT 기반 인증 시스템
- **마이페이지**: 닉네임 변경, 비밀번호 변경
- **계정 관리**: 사용자 정보 수정 및 계정 삭제

## 🛠 기술 스택

### Frontend Framework
- **Next.js 14.1.0** - React 기반 풀스택 프레임워크
- **React 18** - 사용자 인터페이스 라이브러리
- **TypeScript** - 정적 타입 체크

### 스타일링 & UI
- **TailwindCSS** - 유틸리티-퍼스트 CSS 프레임워크
- **Radix UI** - 접근성을 고려한 UI 컴포넌트 라이브러리
- **Lucide React** - 아이콘 라이브러리

### 상태 관리 & 데이터
- **Zustand** - 경량 상태 관리 라이브러리
- **Axios** - HTTP 클라이언트
- **js-cookie** - 쿠키 관리

### 차트 & 시각화
- **Chart.js** - 범용 차트 라이브러리
- **Lightweight Charts** - 금융 차트 전문 라이브러리
- **Recharts** - React용 차트 라이브러리
- **chartjs-adapter-date-fns** - 시간축 어댑터

### 기타
- **WebSocket** - 실시간 데이터 통신
- **date-fns** - 날짜/시간 유틸리티

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── api/               # API 라우트
│   ├── chart/             # 차트 페이지
│   ├── exchange/          # 거래소 페이지
│   ├── investments/       # 투자 내역 페이지
│   ├── login/             # 로그인 페이지
│   ├── mypage/           # 마이페이지
│   ├── password/         # 비밀번호 변경
│   ├── portfolio/        # 포트폴리오 페이지
│   ├── signup/           # 회원가입 페이지
│   ├── layout.tsx        # 루트 레이아웃
│   └── page.tsx          # 홈페이지
├── components/           # 재사용 가능한 컴포넌트
│   ├── ui/              # 기본 UI 컴포넌트
│   ├── Header.tsx       # 헤더 컴포넌트
│   ├── TradeForm.tsx    # 거래 폼
│   ├── CandleChart.tsx  # 캔들 차트
│   └── ...
├── store/               # Zustand 상태 관리
│   ├── authStore.ts     # 인증 상태
│   ├── marketStore.ts   # 시장 데이터
│   ├── assetStore.ts    # 자산 정보
│   └── candleStore.ts   # 차트 데이터
├── lib/                 # 유틸리티 함수
│   ├── apiClient.ts     # API 클라이언트
│   ├── upbitApi.ts      # Upbit API 연동
│   ├── chartUtils.tsx   # 차트 유틸리티
│   └── ...
├── hooks/               # 커스텀 훅
├── types/               # TypeScript 타입 정의
└── providers/           # Context 프로바이더
```


## 🔗 API 연동

이 프론트엔드는 다음 백엔드 서비스들과 연동됩니다:

- **Auth Service**: 사용자 인증 및 계정 관리
- **Trading Service**: 거래 주문 처리 및 포트폴리오 관리
- **Broadcaster Service**: 실시간 시세 및 차트 데이터 WebSocket 통신
- **Orderbook Service**: 실시간 호가 정보

## 🌟 주요 페이지

### 홈페이지 (`/`)
- 서비스 소개 및 랜딩 페이지
- 로그인/회원가입 유도

### 거래소 (`/exchange`)
- 실시간 차트 및 시세 조회
- 매수/매도 주문 입력
- 호가창 및 체결 내역

### 포트폴리오 (`/portfolio`)
- 보유 종목 현황 (`/portfolio/holdings`)
- 수익/손실 분석 (`/portfolio/profit-loss`)

### 투자 내역 (`/investments`)
- 거래 내역 조회 (`/investments/transaction-history`)
- 대기 주문 관리 (`/investments/wait-orders`)

## 🔧 개발 가이드

### 상태 관리
Zustand를 사용하여 클라이언트 상태를 관리합니다:
- `authStore`: 사용자 인증 상태
- `marketStore`: 시장 데이터 및 실시간 시세
- `assetStore`: 사용자 자산 및 포트폴리오
- `candleStore`: 차트 및 캔들 데이터

### 컴포넌트 구조
- 재사용 가능한 UI 컴포넌트는 `components/ui/`에 위치
- 페이지별 특화 컴포넌트는 `components/`에 위치
- 모든 컴포넌트는 TypeScript로 작성

### 스타일링
- TailwindCSS 유틸리티 클래스 사용
- 일관된 디자인 시스템 적용
- 반응형 웹 디자인 구현

---

**코윙**으로 안전하고 재미있는 모의투자를 경험해보세요! 🚀
