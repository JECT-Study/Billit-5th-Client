import '@/global.css';

import { router, Stack, usePathname, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const unstable_settings = {
  initialRouteName: '(auth)',
};

export default function RootLayout() {
  const pathname = usePathname();
  const segments = useSegments();
  const hasEnteredTabs = useRef(false);
  const isInTabs = segments[0] === '(tabs)';
  const isAuthPath =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/onboarding';

  useEffect(() => {
    if (isInTabs) {
      hasEnteredTabs.current = true;
      return;
    }

    if (hasEnteredTabs.current && isAuthPath) {
      router.replace('/trips');
    }
  }, [isAuthPath, isInTabs]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
