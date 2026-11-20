import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { registrationTokenStorage } from '@/lib/registrationTokenStorage';
import { mobileTokenStorage } from '@/lib/tokenStorage';
import type { AuthTokens } from '@/features/auth/types';

const refreshTokenKey = 'billit.refreshToken';

// 토큰을 지울 때마다 올린다. 진행 중이던 갱신이 끝났을 때 값이 바뀌었으면 그 사이 로그아웃·만료된 것이다.
let sessionVersion = 0;

export function getSessionVersion() {
  return sessionVersion;
}

async function setRefreshToken(token: string | null) {
  if (Platform.OS === 'web') {
    if (typeof localStorage === 'undefined') {
      return;
    }
    if (token) {
      localStorage.setItem(refreshTokenKey, token);
    } else {
      localStorage.removeItem(refreshTokenKey);
    }
    return;
  }
  if (token) {
    await SecureStore.setItemAsync(refreshTokenKey, token);
  } else {
    await SecureStore.deleteItemAsync(refreshTokenKey);
  }
}

export async function getRefreshToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return typeof localStorage === 'undefined'
      ? null
      : localStorage.getItem(refreshTokenKey);
  }
  return SecureStore.getItemAsync(refreshTokenKey);
}

// Access Token이 만료돼도 Refresh Token이 있으면 첫 회원 API에서 갱신되므로 로그인 상태로 본다
export async function hasStoredSession(): Promise<boolean> {
  return (await getRefreshToken()) !== null;
}

// access는 mobileTokenStorage에, refresh는 별도 키에 저장
export function getAccessToken() {
  return mobileTokenStorage.getToken();
}

// 토큰 저장·삭제를 한 줄로 세운다. RefreshToken·AccessToken를 쓰는 await 사이에 다른 저장·삭제가 끼어들면
// 로그아웃 뒤에 AccessToken만 남는 등 토큰 쌍이 어긋날 수 있다.
let storageQueue: Promise<unknown> = Promise.resolve();

// 앞 작업이 실패해도 다음 작업은 실행한다.
function withStorageLock<T>(task: () => Promise<T>): Promise<T> {
  const result = storageQueue.then(task, task);
  storageQueue = result.catch(() => undefined);
  return result;
}

async function writeAuthTokens(tokens: AuthTokens) {
  await setRefreshToken(tokens.refreshToken);
  await mobileTokenStorage.setToken(tokens.accessToken);
}

export function saveAuthTokens(tokens: AuthTokens): Promise<void> {
  return withStorageLock(() => writeAuthTokens(tokens));
}

// 버전 확인과 저장을 락 안에서 한 번에 한다. 그 사이 토큰이 지워졌으면 저장하지 않고 false를 돌려준다.
export function saveAuthTokensIfVersion(
  tokens: AuthTokens,
  expectedVersion: number,
): Promise<boolean> {
  return withStorageLock(async () => {
    if (sessionVersion !== expectedVersion) {
      return false;
    }
    await writeAuthTokens(tokens);
    return true;
  });
}

export function clearAuthTokens(): Promise<void> {
  return withStorageLock(async () => {
    sessionVersion += 1;
    await mobileTokenStorage.setToken(null);
    await setRefreshToken(null);
  });
}

// setToken이 반환되기 전에 메모리 저장을 끝내므로 await하지 않는다.
export function setRegistrationToken(token: string | null) {
  void registrationTokenStorage.setToken(token);
}

export function getRegistrationToken() {
  return registrationTokenStorage.getToken();
}
