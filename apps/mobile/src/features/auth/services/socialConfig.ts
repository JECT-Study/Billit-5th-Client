import Constants from 'expo-constants';

type SocialExtra = {
  appEnv?: string;
  googleWebClientId?: string;
  googleIosClientId?: string;
  kakaoNativeAppKey?: string;
};

// app.config.ts의 extra 값 (EAS 빌드, 로컬 pnpm dev 모두 같은 경로로 읽힘)
const extra = (Constants.expoConfig?.extra ?? {}) as SocialExtra;

export const socialConfig = {
  appEnv: extra.appEnv ?? 'development',
  googleWebClientId: extra.googleWebClientId ?? '',
  googleIosClientId: extra.googleIosClientId ?? '',
  kakaoNativeAppKey: extra.kakaoNativeAppKey ?? '',
};
