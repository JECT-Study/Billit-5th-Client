import '@/global.css';
import '@/shared/ui/cssInterop';

import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { router, Stack, usePathname, useSegments } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import { apiClient } from '@/lib/api';
import { usePreviewUpdate } from '@/lib/previewUpdate';
import { queryClient } from '@/lib/queryClient';

import { onSessionExpired } from '@/features/auth/services/sessionEvents';
import { attachTokenRefresh } from '@/features/auth/services/tokenRefresh';

// 회원 API가 401이면 토큰을 갱신하고 다시 보낸다
attachTokenRefresh(apiClient);

// eslint-disable-next-line @typescript-eslint/naming-convention
export const unstable_settings = {
  initialRouteName: '(auth)',
};

const isMockApiEnabled =
  __DEV__ && process.env.EXPO_PUBLIC_USE_MOCK_API === 'true';

export default function RootLayout() {
  const [isFontsLoaded, fontLoadError] = useFonts({
    'SUIT-Thin': require('../../../packages/fonts/SUIT-Thin.otf'),
    'SUIT-ExtraLight': require('../../../packages/fonts/SUIT-ExtraLight.otf'),
    'SUIT-Light': require('../../../packages/fonts/SUIT-Light.otf'),
    'SUIT-Regular': require('../../../packages/fonts/SUIT-Regular.otf'),
    'SUIT-Medium': require('../../../packages/fonts/SUIT-Medium.otf'),
    'SUIT-SemiBold': require('../../../packages/fonts/SUIT-SemiBold.otf'),
    'SUIT-Bold': require('../../../packages/fonts/SUIT-Bold.otf'),
    'SUIT-ExtraBold': require('../../../packages/fonts/SUIT-ExtraBold.otf'),
    'SUIT-Heavy': require('../../../packages/fonts/SUIT-Heavy.otf'),
  });

  usePreviewUpdate();

  const pathname = usePathname();
  const segments = useSegments();
  const hasEnteredTabs = useRef(false);
  const [isMockingReady, setMockingReady] = useState(!isMockApiEnabled);
  const isInTabs = segments[0] === '(tabs)';
  const isAuthPath =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/onboarding';

  useEffect(
    () =>
      onSessionExpired(() => {
        hasEnteredTabs.current = false;
        router.replace('/login');
      }),
    [],
  );

  useEffect(() => {
    if (isInTabs) {
      hasEnteredTabs.current = true;
      return;
    }

    if (hasEnteredTabs.current && isAuthPath) {
      router.replace('/trips');
    }
  }, [isAuthPath, isInTabs]);

  useEffect(() => {
    if (!isMockApiEnabled) return;

    void import('@/mocks')
      .then(({ enableMocking }) => enableMocking())
      .catch((error: unknown) => {
        console.warn('개발용 API 목을 시작하지 못했습니다.', error);
      })
      .finally(() => setMockingReady(true));
  }, []);

  if ((!isFontsLoaded && !fontLoadError) || !isMockingReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(flows)" />
        <Stack.Screen name="(modals)" options={{ presentation: 'modal' }} />
      </Stack>
    </QueryClientProvider>
  );
}
