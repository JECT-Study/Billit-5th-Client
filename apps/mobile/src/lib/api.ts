import { createApiClient } from '@billit/api';

import { mobileTokenStorage } from './token-storage';

export const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

export const apiClient = createApiClient({
  baseURL: apiBaseUrl,
  tokenStorage: mobileTokenStorage,
});
