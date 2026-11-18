import { createApiClient } from '@billit/api';

import { registrationTokenStorage } from '@/lib/registrationTokenStorage';
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

// 가입 전용 토큰만 붙인다. 회원용 apiClient와 토큰을 섞지 않는다.
export const registrationApiClient = createApiClient({
  baseURL: apiBaseUrl,
  tokenStorage: registrationTokenStorage,
});
