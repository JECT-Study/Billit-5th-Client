import '@/global.css';

import { ApiProvider } from '@billit/api/client';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/AnimatedIcon';
import AppTabs from '@/components/AppTabs';
import { apiClient } from '@/lib/api';

SplashScreen.preventAutoHideAsync();

const suitFonts = {
  'SUIT-Thin': require('../../../../packages/fonts/SUIT-Thin.otf'),
  'SUIT-ExtraLight': require('../../../../packages/fonts/SUIT-ExtraLight.otf'),
  'SUIT-Light': require('../../../../packages/fonts/SUIT-Light.otf'),
  'SUIT-Regular': require('../../../../packages/fonts/SUIT-Regular.otf'),
  'SUIT-Medium': require('../../../../packages/fonts/SUIT-Medium.otf'),
  'SUIT-SemiBold': require('../../../../packages/fonts/SUIT-SemiBold.otf'),
  'SUIT-Bold': require('../../../../packages/fonts/SUIT-Bold.otf'),
  'SUIT-ExtraBold': require('../../../../packages/fonts/SUIT-ExtraBold.otf'),
  'SUIT-Heavy': require('../../../../packages/fonts/SUIT-Heavy.otf'),
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isFontsLoaded, fontError] = useFonts(suitFonts);

  if (!isFontsLoaded && !fontError) {
    return null;
  }

  return (
    <ApiProvider client={apiClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <AppTabs />
      </ThemeProvider>
    </ApiProvider>
  );
}
