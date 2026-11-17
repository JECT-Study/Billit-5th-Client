import { publicApiClient, registrationApiClient } from '@/lib/api';

import { registrationInfoSchema } from '@/features/auth/registrationInfoSchema';
import { RegistrationTokenExpiredError } from '@/features/auth/registrationTokenExpiredError';
import { getRegistrationToken } from '@/features/auth/services/authStorage';
import type { SocialCredential } from '@/features/auth/services/socialSignIn';
import type {
  AuthTokens,
  CompleteRegistrationRequest,
  SocialLoginResult,
} from '@/features/auth/types';

type SocialLoginResponse = { data: SocialLoginResult };
type TokenRefreshResponse = { data: AuthTokens };

const registrationPath = '/api/v1/me/registration';

async function requireRegistrationToken() {
  const token = await getRegistrationToken();
  if (!token) {
    throw new RegistrationTokenExpiredError();
  }
}

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

export async function getRegistration() {
  await requireRegistrationToken();
  const response = await registrationApiClient.get<{ data: unknown }>(
    registrationPath,
  );
  return registrationInfoSchema.parse(response.data.data);
}

export async function completeRegistration(
  request: CompleteRegistrationRequest,
): Promise<AuthTokens> {
  await requireRegistrationToken();
  const response = await registrationApiClient.post<{ data: AuthTokens }>(
    registrationPath,
    request,
  );
  return response.data.data;
}
