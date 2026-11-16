import { createApiClient } from '@billit/api';

import { mobileTokenStorage } from '@/lib/tokenStorage';

export const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

export const apiClient = createApiClient({
  baseURL: apiBaseUrl,
  tokenStorage: mobileTokenStorage,
});

// 토큰이 없는 요청(소셜 로그인 등)용
export const publicApiClient = createApiClient({
  baseURL: apiBaseUrl,
  tokenStorage: {
    getToken: async () => null,
    setToken: async () => {},
  },
});
