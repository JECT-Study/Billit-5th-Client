import { registrationApiClient } from '@/lib/api';

import { RegistrationTokenExpiredError } from '@/features/auth/registrationTokenExpiredError';
import {
  completeRegistration,
  getRegistration,
} from '@/features/auth/services/authApi';
import { getRegistrationToken } from '@/features/auth/services/authStorage';
import type { CompleteRegistrationRequest } from '@/features/auth/types';

jest.mock('@/lib/api', () => ({
  registrationApiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock('@/features/auth/services/authStorage', () => ({
  getRegistrationToken: jest.fn(),
}));

const request: CompleteRegistrationRequest = {
  platform: 'IOS',
  appVersion: '1.0.0',
  isAgeEligible: true,
  agreements: [{ termsId: 'required-terms', isAgreed: true }],
};

describe('registration api', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(getRegistrationToken).mockResolvedValue(null);
  });

  it('getRegistration은 가입 토큰이 없으면 요청 전에 만료 에러를 던진다', async () => {
    await expect(getRegistration()).rejects.toBeInstanceOf(
      RegistrationTokenExpiredError,
    );

    expect(registrationApiClient.get).not.toHaveBeenCalled();
  });

  it('completeRegistration은 가입 토큰이 없으면 요청 전에 만료 에러를 던진다', async () => {
    await expect(completeRegistration(request)).rejects.toBeInstanceOf(
      RegistrationTokenExpiredError,
    );

    expect(registrationApiClient.post).not.toHaveBeenCalled();
  });
});
