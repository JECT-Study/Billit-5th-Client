import { createApiClient } from '@billit/api';

import { webTokenStorage } from './tokenStorage';

export const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

export const apiClient = createApiClient({
  baseURL: apiBaseUrl,
  tokenStorage: webTokenStorage,
});
