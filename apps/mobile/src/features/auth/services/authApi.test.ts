import { AxiosError } from 'axios';

import { publicApiClient, registrationApiClient } from '@/lib/api';

import { RegistrationTokenExpiredError } from '@/features/auth/registrationTokenExpiredError';
import {
  completeRegistration,
  getRegistration,
  logout,
} from '@/features/auth/services/authApi';
import {
  getAccessToken,
  getRefreshToken,
  getRegistrationToken,
} from '@/features/auth/services/authStorage';
import type { CompleteRegistrationRequest } from '@/features/auth/types';

jest.mock('@/lib/api', () => ({
  publicApiClient: {
    post: jest.fn(),
  },
  registrationApiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock('@/features/auth/services/authStorage', () => ({
  getAccessToken: jest.fn(),
  getRefreshToken: jest.fn(),
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

function httpError(status: number) {
  return new AxiosError(`${status}`, 'ERR_BAD_REQUEST', undefined, undefined, {
    status,
    statusText: '',
    data: {},
    headers: {},
    config: { headers: {} as never },
  });
}

function networkError() {
  return new AxiosError('Network Error', 'ERR_NETWORK');
}

describe('logout', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(getAccessToken).mockResolvedValue(null);
    jest.mocked(getRefreshToken).mockResolvedValue(null);
  });

  it('Access Token이 있으면 Authorization 헤더로 한 번만 요청한다', async () => {
    jest.mocked(getAccessToken).mockResolvedValue('access-token');
    jest.mocked(getRefreshToken).mockResolvedValue('refresh-token');
    jest.mocked(publicApiClient.post).mockResolvedValue({ status: 204 });

    await expect(logout()).resolves.toBeUndefined();

    expect(publicApiClient.post).toHaveBeenCalledTimes(1);
    expect(publicApiClient.post).toHaveBeenCalledWith(
      '/api/v1/auth/logout',
      undefined,
      { headers: { Authorization: 'Bearer access-token' } },
    );
  });

  it('헤더 요청이 401이면 저장된 Refresh Token을 본문으로 한 번 더 요청한다', async () => {
    jest.mocked(getAccessToken).mockResolvedValue('access-token');
    jest.mocked(getRefreshToken).mockResolvedValue('refresh-token');
    jest
      .mocked(publicApiClient.post)
      .mockRejectedValueOnce(httpError(401))
      .mockResolvedValueOnce({ status: 204 });

    await expect(logout()).resolves.toBeUndefined();

    expect(publicApiClient.post).toHaveBeenNthCalledWith(
      1,
      '/api/v1/auth/logout',
      undefined,
      { headers: { Authorization: 'Bearer access-token' } },
    );
    expect(publicApiClient.post).toHaveBeenNthCalledWith(
      2,
      '/api/v1/auth/logout',
      { refreshToken: 'refresh-token' },
    );
  });

  it('Access Token이 없으면 Refresh Token 본문으로만 요청한다', async () => {
    jest.mocked(getRefreshToken).mockResolvedValue('refresh-token');
    jest.mocked(publicApiClient.post).mockResolvedValue({ status: 204 });

    await logout();

    expect(publicApiClient.post).toHaveBeenCalledTimes(1);
    expect(publicApiClient.post).toHaveBeenCalledWith('/api/v1/auth/logout', {
      refreshToken: 'refresh-token',
    });
  });

  it('토큰이 둘 다 없으면 요청하지 않는다', async () => {
    await expect(logout()).resolves.toBeUndefined();

    expect(publicApiClient.post).not.toHaveBeenCalled();
  });

  it('헤더 요청이 401이어도 Refresh Token이 없으면 본문 요청 없이 실패한다', async () => {
    jest.mocked(getAccessToken).mockResolvedValue('access-token');
    jest.mocked(publicApiClient.post).mockRejectedValueOnce(httpError(401));

    await expect(logout()).rejects.toBeInstanceOf(AxiosError);

    expect(publicApiClient.post).toHaveBeenCalledTimes(1);
  });

  it('네트워크가 끊기면 Refresh Token 본문으로 다시 요청하지 않는다', async () => {
    jest.mocked(getAccessToken).mockResolvedValue('access-token');
    jest.mocked(getRefreshToken).mockResolvedValue('refresh-token');
    jest.mocked(publicApiClient.post).mockRejectedValueOnce(networkError());

    await expect(logout()).rejects.toBeInstanceOf(AxiosError);

    expect(publicApiClient.post).toHaveBeenCalledTimes(1);
  });
});
