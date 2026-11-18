import type { InternalAxiosRequestConfig } from 'axios';

import { createApiClient } from './createApiClient';

const tokenStorage = {
  async getToken() {
    return null;
  },
  async setToken() {},
};

describe('createApiClient', () => {
  it('sets a default timeout so requests do not wait forever', () => {
    const client = createApiClient({
      baseURL: 'http://localhost:8080',
      tokenStorage,
    });

    expect(client.defaults.timeout).toBe(15000);
  });

  it('uses the given timeout', () => {
    const client = createApiClient({
      baseURL: 'http://localhost:8080',
      tokenStorage,
      timeoutMs: 3_000,
    });

    expect(client.defaults.timeout).toBe(3_000);
  });

  it('adds a bearer token from storage', async () => {
    const client = createApiClient({
      baseURL: 'http://localhost:8080',
      tokenStorage: {
        async getToken() {
          return 'token-1';
        },
        async setToken() {},
      },
    });

    client.defaults.adapter = async (config) => ({
      data: { ok: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });

    const response = await client.get('/health');
    const authorization = axiosHeader(response.config, 'Authorization');

    expect(authorization).toBe('Bearer token-1');
  });

  it('leaves the request unchanged when no token is stored', async () => {
    const client = createApiClient({
      baseURL: 'http://localhost:8080',
      tokenStorage: {
        async getToken() {
          return null;
        },
        async setToken() {},
      },
    });

    client.defaults.adapter = async (config) => ({
      data: { ok: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });

    const response = await client.get('/health');

    expect(axiosHeader(response.config, 'Authorization')).toBeUndefined();
  });
});

function axiosHeader(config: InternalAxiosRequestConfig, name: string) {
  const headers = config.headers as InternalAxiosRequestConfig['headers'] & {
    get?: (header: string) => unknown;
  };
  const value = headers.get?.(name) ?? headers[name as keyof typeof headers];
  return typeof value === 'string' ? value : undefined;
}
