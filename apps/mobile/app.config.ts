import type { ExpoConfig } from 'expo/config';

type AppEnv = 'development' | 'production';

const appEnv: AppEnv =
  process.env.APP_ENV === 'production' ? 'production' : 'development';

const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';
const easProjectId =
  process.env.EAS_PROJECT_ID ?? 'a8b2d0e5-bb17-43d9-b41e-d2fab0ef17b8';

// 소셜 로그인 공개 식별자
const googleClientIds: Record<
  AppEnv,
  { webClientId: string; iosClientId: string }
> = {
  development: {
    webClientId:
      '340075255253-4krej20mcmgkfqubc1urgeiavbnidchd.apps.googleusercontent.com',
    iosClientId:
      '340075255253-1pl65qu5brsind4l55r6fq21ol465aso.apps.googleusercontent.com',
  },
  production: {
    webClientId:
      '57223671245-pbjmh9rbfgft56fat2e9e9c2joqaeoum.apps.googleusercontent.com',
    iosClientId:
      '57223671245-5dsesnakhjhm2qcfl9d7f184odtod4m8.apps.googleusercontent.com',
  },
};
const kakaoNativeAppKey = 'd0e43e75e5cbbc817e4603bcdb10d7a5';

const { webClientId: googleWebClientId, iosClientId: googleIosClientId } =
  googleClientIds[appEnv];

// iOS client ID를 뒤집은 값이 Google Sign-In URL scheme
const googleIosUrlScheme = `com.googleusercontent.apps.${googleIosClientId.replace(
  '.apps.googleusercontent.com',
  '',
)}`;

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
    bundleIdentifier: 'app.billit.mobile',
    appleTeamId: '47PCQDM827',
    usesAppleSignIn: true,
  },
  android: {
    package: 'app.billit.mobile',
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
    'expo-apple-authentication',
    'expo-secure-store',
    [
      '@react-native-google-signin/google-signin',
      { iosUrlScheme: googleIosUrlScheme },
    ],
    [
      '@react-native-kakao/core',
      {
        nativeAppKey: kakaoNativeAppKey,
        android: { authCodeHandlerActivity: true },
        ios: { handleKakaoOpenUrl: true },
      },
    ],
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
    appEnv,
    googleWebClientId,
    googleIosClientId,
    kakaoNativeAppKey,
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
