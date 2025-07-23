# 빌드 스테이지
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# ARG로 빌드 타임에 동적 설정
ARG NEXT_PUBLIC_URL=https://localhost
ENV NEXT_PUBLIC_URL=${NEXT_PUBLIC_URL}

RUN npm run build

# 실행 스테이지
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 3000
CMD ["npm", "run", "start"]