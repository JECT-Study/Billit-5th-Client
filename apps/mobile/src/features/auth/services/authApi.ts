import { publicApiClient } from '@/lib/api';
import type { AuthTokens, SocialLoginResult } from '@/features/auth/types';
import type { SocialCredential } from '@/features/auth/services/socialSignIn';

type SocialLoginResponse = { data: SocialLoginResult };
type TokenRefreshResponse = { data: AuthTokens };

export async function socialLogin(
  credential: SocialCredential,
): Promise<SocialLoginResult> {
  const response = await publicApiClient.post<SocialLoginResponse>(
    '/api/v1/auth/social-logins',
    credential,
  );
  return response.data.data;
}

export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  const response = await publicApiClient.post<TokenRefreshResponse>(
    '/api/v1/auth/token-refreshes',
    { refreshToken },
  );
  return response.data.data;
}
