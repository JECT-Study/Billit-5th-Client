import { isAxiosError, type AxiosInstance } from 'axios';

import { parseApiError } from '@/lib/apiError';
import { refreshTokens } from '@/features/auth/services/authApi';
import {
  clearAuthTokens,
  getRefreshToken,
  saveAuthTokens,
} from '@/features/auth/services/authStorage';
import { notifySessionExpired } from '@/features/auth/services/sessionEvents';
import type { AuthTokens } from '@/features/auth/types';

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retried?: boolean;
  }
}

export class SessionExpiredError extends Error {
  constructor() {
    super('로그인이 만료되었습니다.');
  }
}

function isNetworkError(error: unknown) {
  return isAxiosError(error) && !error.response;
}

async function expireSession(): Promise<never> {
  await clearAuthTokens();
  notifySessionExpired();
  throw new SessionExpiredError();
}

// 응답을 못 받은 경우 BE가 직전 Refresh Token 재시도를 30초 동안 한 번 받아 주므로 한 번만 재시도
async function requestRefresh(refreshToken: string): Promise<AuthTokens> {
  try {
    return await refreshTokens(refreshToken);
  } catch (error) {
    if (isNetworkError(error)) {
      return refreshTokens(refreshToken);
    }
    throw error;
  }
}

async function runRefresh(): Promise<string> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return expireSession();
  }

  let tokens: AuthTokens;
  try {
    tokens = await requestRefresh(refreshToken);
  } catch (error) {
    // 네트워크가 끊긴 경우는 세션을 유지하고 이번 요청만 실패시킨다
    const status = parseApiError(error)?.status;
    if (status === 400 || status === 401) {
      return expireSession();
    }
    throw error;
  }

  await saveAuthTokens(tokens);
  return tokens.accessToken;
}

let refreshing: Promise<string> | null = null;

// 같은 Refresh Token을 동시에 두 번 보내면 하나는 401이 되므로, 진행 중인 갱신이 있으면 그 결과를 함께 쓴다
export function refreshAccessToken(): Promise<string> {
  refreshing ??= runRefresh().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

// 회원 API가 401이면 토큰을 갱신하고 원래 요청을 한 번 다시 보낸다
export function attachTokenRefresh(client: AxiosInstance) {
  client.interceptors.response.use(undefined, async (error: unknown) => {
    if (
      !isAxiosError(error) ||
      error.response?.status !== 401 ||
      !error.config ||
      error.config._retried
    ) {
      throw error;
    }

    const config = error.config;
    config._retried = true;
    const accessToken = await refreshAccessToken();
    config.headers.Authorization = `Bearer ${accessToken}`;
    return client(config);
  });
}
