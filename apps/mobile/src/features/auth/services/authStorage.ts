import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

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

// access는 mobileTokenStorage에, refresh는 별도 키에 저장
export async function saveAuthTokens(tokens: AuthTokens) {
  await setRefreshToken(tokens.refreshToken);
  await mobileTokenStorage.setToken(tokens.accessToken);
}

export async function clearAuthTokens() {
  await mobileTokenStorage.setToken(null);
  await setRefreshToken(null);
}

// 가입 전용 토큰은 가입이 끝날 때까지만 필요해서 저장하지 않고 메모리에 둔다
let registrationToken: string | null = null;

export function setRegistrationToken(token: string | null) {
  registrationToken = token;
}

export function getRegistrationToken() {
  return registrationToken;
}
