import { clearAppleFullName } from '@/features/auth/services/appleFullNameCache';
import { socialLogin } from '@/features/auth/services/authApi';
import {
  saveAuthTokens,
  setRegistrationToken,
} from '@/features/auth/services/authStorage';
import { saveRecentLoginProvider } from '@/features/auth/services/recentLoginStorage';
import {
  requestSocialCredential,
  type SocialProvider,
} from '@/features/auth/services/socialSignIn';

export type LoginOutcome = 'AUTHENTICATED' | 'REGISTRATION_REQUIRED';

// SDK 로그인 → BE 로그인 → 응답에 따라 토큰 저장. 화면 이동은 호출한 쪽이 한다
export async function loginWithProvider(
  provider: SocialProvider,
): Promise<LoginOutcome> {
  const credential = await requestSocialCredential(provider);
  const result = await socialLogin(credential);
  if (provider === 'APPLE') {
    // BE가 이름을 받았으니 더 보관하지 않는다
    clearAppleFullName();
  }
  try {
    await saveRecentLoginProvider(provider);
  } catch {}

  if (result.status === 'AUTHENTICATED') {
    await saveAuthTokens({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
    setRegistrationToken(null);
    return 'AUTHENTICATED';
  }

  setRegistrationToken(result.registrationToken);
  return 'REGISTRATION_REQUIRED';
}
