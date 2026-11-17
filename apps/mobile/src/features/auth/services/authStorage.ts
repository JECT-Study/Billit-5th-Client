import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { registrationTokenStorage } from '@/lib/registrationTokenStorage';
import { mobileTokenStorage } from '@/lib/tokenStorage';
import type { AuthTokens } from '@/features/auth/types';

const refreshTokenKey = 'billit.refreshToken';

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
export async function saveAuthTokens(tokens: AuthTokens) {
  await setRefreshToken(tokens.refreshToken);
  await mobileTokenStorage.setToken(tokens.accessToken);
}

export async function clearAuthTokens() {
  await mobileTokenStorage.setToken(null);
  await setRefreshToken(null);
}

// setToken이 반환되기 전에 메모리 저장을 끝내므로 await하지 않는다.
export function setRegistrationToken(token: string | null) {
  void registrationTokenStorage.setToken(token);
}

export function getRegistrationToken() {
  return registrationTokenStorage.getToken();
}
