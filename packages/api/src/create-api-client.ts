import axios, { type AxiosInstance } from 'axios';

import type { TokenStorage } from './token-storage';

export function createApiClient(options: {
  baseURL: string;
  tokenStorage: TokenStorage;
}): AxiosInstance {
  const client = axios.create({
    baseURL: options.baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use(async (config) => {
    const token = await options.tokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return client;
}
