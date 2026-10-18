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

`pnpm --filter @billit/web build`는 `apps/web/out`에 정적 파일을 만듭니다. nginx의 루트를 이 폴더로 두면 됩니다. 주소 끝의 슬래시를 유지하므로 `try_files $uri $uri/ $uri/index.html`로 라우트를 찾습니다.

`NEXT_PUBLIC_API_URL`은 빌드 시점에 번들에 들어갑니다. 운영 API 주소로 배포하려면 빌드 전에 그 값을 넣습니다.

## 환경 변수

예시는 각 앱의 `.env.example`에 있습니다.

- 웹: `apps/web/.env`의 `NEXT_PUBLIC_API_URL`
- 앱: `apps/mobile/.env`의 `EXPO_PUBLIC_API_URL`

로컬 백엔드는 아래의 CORS를 허용합니다.

- `http://localhost:3000`
- `http://localhost:5173`

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
