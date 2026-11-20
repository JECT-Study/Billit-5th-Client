import { publicApiClient, registrationApiClient } from '@/lib/api';
import { parseApiError } from '@/lib/apiError';

import { registrationInfoSchema } from '@/features/auth/registrationInfoSchema';
import { RegistrationTokenExpiredError } from '@/features/auth/registrationTokenExpiredError';
import {
  getAccessToken,
  getRefreshToken,
  getRegistrationToken,
} from '@/features/auth/services/authStorage';
import type { SocialCredential } from '@/features/auth/services/socialSignIn';
import type {
  AuthTokens,
  CompleteRegistrationRequest,
  SocialLoginResult,
} from '@/features/auth/types';

type SocialLoginResponse = { data: SocialLoginResult };
type TokenRefreshResponse = { data: AuthTokens };

const registrationPath = '/api/v1/me/registration';
const logoutPath = '/api/v1/auth/logout';

function isUnauthorized(error: unknown) {
  return parseApiError(error)?.status === 401;
}

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

// 401이 나도 토큰 갱신·재시도가 일어나지 않게 publicApiClient로 보낸다.
export async function logout() {
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();

  if (accessToken) {
    try {
      await publicApiClient.post(logoutPath, undefined, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return;
    } catch (error) {
      if (!isUnauthorized(error) || !refreshToken) {
        throw error;
      }
    }
  }

  if (refreshToken) {
    await publicApiClient.post(logoutPath, { refreshToken });
  }
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
