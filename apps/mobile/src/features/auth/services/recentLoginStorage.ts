import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { SocialProvider } from '@/features/auth/services/socialSignIn';

const recentLoginProviderKey = 'billit.recentLoginProvider';
const socialProviders: readonly SocialProvider[] = ['GOOGLE', 'KAKAO', 'APPLE'];

// 로그아웃해도 남겨 두어야 해서 토큰과 따로 저장한다
export async function saveRecentLoginProvider(provider: SocialProvider) {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(recentLoginProviderKey, provider);
    }
    return;
  }
  await SecureStore.setItemAsync(recentLoginProviderKey, provider);
}

export async function getRecentLoginProvider(): Promise<SocialProvider | null> {
  const value =
    Platform.OS === 'web'
      ? typeof localStorage === 'undefined'
        ? null
        : localStorage.getItem(recentLoginProviderKey)
      : await SecureStore.getItemAsync(recentLoginProviderKey);

  return socialProviders.find((provider) => provider === value) ?? null;
}
