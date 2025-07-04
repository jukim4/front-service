/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // 환경별 웹소켓 URL 설정
    UPBIT_WS_URL: process.env.UPBIT_WS_URL || 'wss://api.upbit.com/websocket/v1',
    UPBIT_API_URL: process.env.UPBIT_API_URL || 'https://api.upbit.com/v1',
  },
}

module.exports = nextConfig 