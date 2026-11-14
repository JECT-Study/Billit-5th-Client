import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { initializeKakaoSDK } from '@react-native-kakao/core';
import { login as loginWithKakaoSdk } from '@react-native-kakao/user';
import * as AppleAuthentication from 'expo-apple-authentication';

import { socialConfig } from '@/features/auth/services/socialConfig';

export type SocialProvider = 'GOOGLE' | 'KAKAO' | 'APPLE';

export type SocialCredential =
  | { provider: 'GOOGLE' | 'KAKAO'; idToken: string }
  | {
      provider: 'APPLE';
      idToken: string;
      authorizationCode: string;
      fullName?: string;
    };

export class SocialLoginCancelledError extends Error {
  constructor() {
    super('소셜 로그인이 취소되었습니다.');
  }
}

// SDK가 취소를 에러 code로 알려주면 취소 에러로 바꾸고, 아니면 그대로 던진다
function throwCancelledOrRethrow(error: unknown, cancelCode: string): never {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === cancelCode
  ) {
    throw new SocialLoginCancelledError();
  }
  throw error;
}

let isGoogleConfigured = false;

function configureGoogle() {
  if (isGoogleConfigured) {
    return;
  }
  GoogleSignin.configure({
    webClientId: socialConfig.googleWebClientId,
    iosClientId: socialConfig.googleIosClientId,
  });
  isGoogleConfigured = true;
}

let kakaoInitPromise: Promise<void> | null = null;

function initializeKakao() {
  // 실패하면 비워서 다음 시도에서 다시 초기화한다
  kakaoInitPromise ??= initializeKakaoSDK(socialConfig.kakaoNativeAppKey).catch(
    (error: unknown) => {
      kakaoInitPromise = null;
      throw error;
    },
  );
  return kakaoInitPromise;
}

async function requestGoogleCredential(): Promise<SocialCredential> {
  configureGoogle();
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();

  if (response.type === 'cancelled') {
    throw new SocialLoginCancelledError();
  }
  if (!response.data.idToken) {
    throw new Error('구글 idToken이 없습니다. webClientId 설정을 확인하세요.');
  }

  return { provider: 'GOOGLE', idToken: response.data.idToken };
}

async function requestKakaoCredential(): Promise<SocialCredential> {
  await initializeKakao();
  const token = await loginWithKakaoSdk().catch((error: unknown) =>
    throwCancelledOrRethrow(error, 'Cancelled'),
  );

  if (!token.idToken) {
    throw new Error(
      '카카오 idToken이 없습니다. 카카오 콘솔의 OpenID Connect 활성화를 확인하세요.',
    );
  }

  return { provider: 'KAKAO', idToken: token.idToken };
}

async function requestAppleCredential(): Promise<SocialCredential> {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME],
  }).catch((error: unknown) =>
    throwCancelledOrRethrow(error, 'ERR_REQUEST_CANCELED'),
  );

  if (!credential.identityToken || !credential.authorizationCode) {
    throw new Error('애플 identityToken 또는 authorizationCode가 없습니다.');
  }

  // 이름은 첫 로그인 때만 내려옴
  const fullName = [
    credential.fullName?.familyName,
    credential.fullName?.givenName,
  ]
    .filter(Boolean)
    .join('');

  return {
    provider: 'APPLE',
    idToken: credential.identityToken,
    authorizationCode: credential.authorizationCode,
    ...(fullName ? { fullName } : {}),
  };
}

export async function requestSocialCredential(
  provider: SocialProvider,
): Promise<SocialCredential> {
  switch (provider) {
    case 'GOOGLE':
      return requestGoogleCredential();
    case 'KAKAO':
      return requestKakaoCredential();
    case 'APPLE':
      return requestAppleCredential();
  }
}
