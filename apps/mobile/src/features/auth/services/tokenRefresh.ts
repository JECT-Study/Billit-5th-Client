import { isAxiosError, type AxiosInstance } from 'axios';

import { parseApiError } from '@/lib/apiError';
import { refreshTokens } from '@/features/auth/services/authApi';
import {
  clearAuthTokens,
  getRefreshToken,
  getSessionVersion,
  saveAuthTokensIfVersion,
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
  const sessionVersion = getSessionVersion();
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

  // 갱신 중에 로그아웃·만료로 토큰이 지워졌으면 새 토큰을 저장하지 않는다.
  // 확인과 저장이 같은 락 안에서 실행되므로 저장 도중에 로그아웃이 끼어들 수 없다.
  const isSaved = await saveAuthTokensIfVersion(tokens, sessionVersion);
  if (!isSaved) {
    throw new SessionExpiredError();
  }
  return tokens.accessToken;
}

let refreshing: Promise<string> | null = null;

// 로그아웃이 시작되면 새 갱신을 막는다. 로그아웃 요청과 새 갱신이 겹치면 서버가 새 토큰을 발급하고,
// 그 세션은 로그아웃 요청에 실리지 않아 서버에 남는다.
let isRefreshBlocked = false;

export function blockRefresh() {
  isRefreshBlocked = true;
}

export function unblockRefresh() {
  isRefreshBlocked = false;
}

// 진행 중인 갱신이 있으면 끝날 때까지 기다린다. 갱신 성공·실패는 묻지 않는다.
// 로그아웃이 갱신 전에 읽은 토큰으로 요청하면, 서버가 그 사이 토큰을 교체해 로그아웃이 실패할 수 있다.
export async function waitForPendingRefresh(): Promise<void> {
  await refreshing?.catch(() => undefined);
}

// 같은 Refresh Token을 동시에 두 번 보내면 하나는 401이 되므로, 진행 중인 갱신이 있으면 그 결과를 함께 쓴다
// 로그아웃 중에는 이미 진행 중인 갱신에만 합류하고 새 갱신은 시작하지 않는다.
// 토큰 정리와 로그인 화면 이동은 로그아웃이 하므로 여기서는 에러만 던진다.
export function refreshAccessToken(): Promise<string> {
  if (refreshing) {
    return refreshing;
  }
  if (isRefreshBlocked) {
    return Promise.reject(new SessionExpiredError());
  }
  refreshing = runRefresh().finally(() => {
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
