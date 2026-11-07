import type { ExpoConfig } from 'expo/config';

const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';
const easProjectId =
  process.env.EAS_PROJECT_ID ?? 'a8b2d0e5-bb17-43d9-b41e-d2fab0ef17b8';

const config: ExpoConfig = {
  name: 'Billit',
  slug: 'billit',
  owner: 'jectbillit',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'billit',
  userInterfaceStyle: 'automatic',
  ios: {
    icon: './assets/expo.icon',
    bundleIdentifier: 'com.jectstudy.billit',
    appleTeamId: '47PCQDM827',
  },
  android: {
    package: 'com.jectstudy.billit',
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  platforms: ['ios', 'android', 'web'],
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    ['expo-build-properties', { ios: { enableSceneSupport: true } }],
    [
      'expo-splash-screen',
      {
        backgroundColor: '#208AEF',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: false,
  },
  extra: {
    apiUrl,
    // src/app이 남아 있으면 Expo Router가 app/을 무시하므로 고정
    // src/app 삭제 후 없애도 됨
    router: {
      root: 'app',
    },
    ...(easProjectId ? { eas: { projectId: easProjectId } } : {}),
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
  ...(easProjectId
    ? {
        updates: {
          url: `https://u.expo.dev/${easProjectId}`,
        },
      }
    : {}),
};

export default config;
