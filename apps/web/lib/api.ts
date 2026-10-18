import { createApiClient } from '@billit/api';

import { webTokenStorage } from './token-storage';

export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export const apiClient = createApiClient({
  baseURL: apiBaseUrl,
  tokenStorage: webTokenStorage,
});
