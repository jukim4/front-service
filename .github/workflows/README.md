# GitHub Actions Version Tagging Workflows

이 프로젝트에는 자동 버전 태깅을 위한 워크플로우가 있습니다.

## 워크플로우 종류

### `workflow-prod.yml` - 프로덕션 배포용
- **트리거**: `prod` 브랜치 푸시
- **기능**: 
  - 날짜 + 커밋 해시로 자동 버전 생성 (예: `2024.01.15-abc1234`)
  - Docker 이미지를 GitHub Container Registry에 푸시
  - `latest` 태그와 날짜 기반 태그 모두 생성
- **사용법**: `prod` 브랜치에 푸시하면 자동으로 실행

## 버전 생성 방식

### 날짜 기반 버전
- **형식**: `YYYY.MM.DD-commitHash`
- **예시**: `2024.01.15-abc1234`
- **장점**: 
  - 매번 고유한 버전 생성
  - 배포 날짜와 커밋을 쉽게 추적 가능
  - 충돌 가능성 없음

## 사용 방법

### 프로덕션 배포
```bash
# prod 브랜치에 푸시하면 자동으로 버전 생성 및 배포
git checkout prod
git push origin prod
```

### 수동 태그 생성 (선택사항)
```bash
# 특정 버전으로 태그하고 싶은 경우
git tag v1.2.3
git push origin v1.2.3
```

## Docker 이미지 태그

워크플로우가 실행되면 다음 태그들이 생성됩니다:

- `ghcr.io/cowing-msa-front:2024.01.15-abc1234` (날짜 기반 버전)
- `ghcr.io/cowing-msa-front:latest` (최신 버전)

## 워크플로우 동작 과정

1. **체크아웃**: 저장소 코드를 가져옴
2. **버전 생성**: 현재 날짜와 커밋 해시로 버전 생성
3. **레지스트리 로그인**: GitHub Container Registry에 로그인
4. **이미지 빌드 및 푸시**: Docker 이미지 빌드 후 레지스트리에 푸시

## 환경 변수

- `REGISTRY`: `ghcr.io` (GitHub Container Registry)
- `IMAGE_NAME`: `cowing-msa-front` (Docker 이미지 이름)

## 권한 설정

워크플로우는 다음 권한이 필요합니다:
- `contents: read`: 저장소 코드 읽기
- `packages: write`: 패키지 레지스트리에 푸시 