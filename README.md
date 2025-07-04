<div align="center">
  <h1 align="center">CoWing Frontend Service</h1>
  <h3 align="center">코윙 서비스의 UI를 제공합니다.</h3>
</div>



## Environment Variables

환경별로 다른 웹소켓 및 API URL을 사용하기 위해 환경변수를 설정할 수 있습니다.

### Local Development
프로젝트 루트에 `.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```bash
# Upbit WebSocket URL (Production)
UPBIT_WS_URL=wss://api.upbit.com/websocket/v1

# Upbit API URL (Production)
UPBIT_API_URL=https://api.upbit.com/v1
```

### Environment Table

| Variable | dev | qa/prod | Example | Explanation |
| -------- | --- | ------- | ------- | ----------- |
| UPBIT_WS_URL | wss://api.upbit.com/websocket/v1 | wss://api.upbit.com/websocket/v1 | wss://api.upbit.com/websocket/v1 | 업비트 웹소켓 연결 URL |
| UPBIT_API_URL | https://api.upbit.com/v1 | https://api.upbit.com/v1 | https://api.upbit.com/v1 | 업비트 REST API URL |
