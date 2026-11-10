import '@/global.css';
import '@/shared/ui/cssInterop';

import { useFonts } from 'expo-font';
import { router, Stack, usePathname, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const unstable_settings = {
  initialRouteName: '(auth)',
};

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

  if (!isFontsLoaded && !fontLoadError) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
