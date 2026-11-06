# Billit Client

Billit 프론트엔드 모노레포입니다. 웹은 Next.js, 앱은 Expo입니다.

## 스택

- pnpm 워크스페이스, Turborepo
- 웹: Next.js 16, 개발 서버 `http://localhost:3000`
- 앱: Expo SDK 57, Expo Router, EAS. 웹 프리뷰 `http://localhost:5173`
- 공유: Axios, TanStack Query, Zustand, zod, react-hook-form
- 스타일: NativeWind 4 (앱), Tailwind CSS 3 (웹). 색 토큰은 `packages/config`에서 공유합니다.
- React `19.2.3`으로 고정합니다. Expo SDK 57과 NativeWind 4.2.7이 이 버전을 기준으로 하고, Next.js도 같은 사본을 씁니다.

Expo SDK 58은 NativeWind 안정 버전이 아직 지원하지 않아 SDK 57을 사용합니다.

## 준비

Node.js 22.13 이상, pnpm 12.

```bash
corepack enable
corepack prepare pnpm@12.14.0 --activate
pnpm install
```

## 실행

```bash
pnpm dev:web          # http://localhost:3000
pnpm dev:mobile       # iOS 시뮬레이터, Android 에뮬레이터, 실기기
pnpm dev:mobile:web   # http://localhost:5173
```

`pnpm dev`는 웹과 Expo를 함께 실행합니다.

## 웹 배포

웹은 Next.js `standalone` 빌드를 컨테이너로 만들어 OCI 서버에 배포합니다. 빌드·배포는 [Billit-5th-Infra](https://github.com/JECT-Study/Billit-5th-Infra) 공통 워크플로를 `.github/workflows/cd.yml`에서 호출합니다.

- `develop` push(웹·공유 패키지 변경 시): 검사 → ARM64 이미지 빌드(`ghcr.io/ject-study/ject-fe`) → 개발 서버 자동 배포
- 운영: Actions의 `cd` 워크플로를 수동 실행하고, 개발에서 검증된 이미지 digest와 커밋 SHA를 넣습니다. 롤백은 `action=rollback`
- 자동 배포는 저장소 변수 `CD_ENABLED=true`일 때만 동작합니다.

로컬에서 이미지를 확인하려면 저장소 루트에서 실행합니다.

```bash
docker build -f apps/web/Dockerfile -t billit-web .
docker run --rm -p 3000:3000 --memory 384m billit-web
curl http://localhost:3000/healthz   # ok
```

서버에서는 Nginx가 `/api/`를 백엔드로, 나머지를 웹 컨테이너(3000)로 보냅니다. 웹과 API가 같은 출처라 API 주소를 빌드에 넣지 않습니다.

## 환경 변수

예시는 각 앱의 `.env.example`에 있습니다.

- 웹: API는 같은 출처의 `/api/v1/...`로 호출합니다. 로컬 개발 서버는 `/api` 요청을 `API_PROXY_TARGET`(기본 `http://localhost:8080`)으로 넘깁니다.
- 앱: `apps/mobile/.env`의 `EXPO_PUBLIC_API_URL`

웹은 프록시를 쓰므로 CORS가 필요 없습니다. Expo 웹 프리뷰(`http://localhost:5173`)만 로컬 백엔드의 CORS 허용이 필요합니다.

인증 토큰은 `Authorization: Bearer` 헤더로 보냅니다. 웹은 `localStorage`, 앱은 `expo-secure-store`, Expo 웹 프리뷰는 `localStorage`를 사용합니다.

## 품질

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm format
```

## EAS

설정은 `apps/mobile/eas.json`과 `apps/mobile/app.config.ts`에 있습니다. 프로파일은 `development`, `preview`, `production`입니다.

EAS 프로젝트는 [@jectbillit/billit](https://expo.dev/accounts/jectbillit/projects/billit)입니다. 스토어 제출용 인증서는 EAS 자격 증명으로 두고 이 저장소에 커밋하지 않습니다.

## 패키지

| 경로                  | 이름                 | 역할                            |
| --------------------- | -------------------- | ------------------------------- |
| `apps/web`            | `@billit/web`        | Next.js                         |
| `apps/mobile`         | `@billit/mobile`     | Expo                            |
| `packages/api`        | `@billit/api`        | Axios 클라이언트, QueryClient   |
| `packages/store`      | `@billit/store`      | Zustand 클라이언트 상태         |
| `packages/validators` | `@billit/validators` | zod 스키마                      |
| `packages/config`     | `@billit/config`     | tsconfig, ESLint, Tailwind 토큰 |
