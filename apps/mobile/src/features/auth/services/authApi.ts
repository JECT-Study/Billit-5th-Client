import { publicApiClient } from '@/lib/api';

import type { SocialLoginResult } from '@/features/auth/types';
import type { SocialCredential } from '@/features/auth/services/socialSignIn';

type SocialLoginResponse = { data: SocialLoginResult };

export async function socialLogin(
  credential: SocialCredential,
): Promise<SocialLoginResult> {
  const response = await publicApiClient.post<SocialLoginResponse>(
    '/api/v1/auth/social-logins',
    credential,
  );
  return response.data.data;
}
