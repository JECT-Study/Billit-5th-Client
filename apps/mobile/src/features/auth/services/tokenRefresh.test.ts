import {
  AxiosError,
  AxiosHeaders,
  create as createAxios,
  type InternalAxiosRequestConfig,
} from 'axios';

import { refreshTokens } from '@/features/auth/services/authApi';
import {
  clearAuthTokens,
  getRefreshToken,
  getSessionVersion,
  saveAuthTokens,
} from '@/features/auth/services/authStorage';
import { onSessionExpired } from '@/features/auth/services/sessionEvents';
import {
  attachTokenRefresh,
  refreshAccessToken,
  SessionExpiredError,
} from '@/features/auth/services/tokenRefresh';

jest.mock('@/features/auth/services/authApi');
jest.mock('@/features/auth/services/authStorage');

const newTokens = { accessToken: 'new-access', refreshToken: 'new-refresh' };

function networkError() {
  return new AxiosError('Network Error', 'ERR_NETWORK');
}

function httpError(status: number, config?: InternalAxiosRequestConfig) {
  const requestConfig = config ?? { headers: new AxiosHeaders() };
  return new AxiosError(
    `${status}`,
    'ERR_BAD_REQUEST',
    requestConfig,
    undefined,
    {
      status,
      statusText: '',
      data: {},
      headers: {},
      config: requestConfig,
    },
  );
}

describe('refreshAccessToken', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(getRefreshToken).mockResolvedValue('old-refresh');
  });

  it('갱신에 성공하면 새 토큰 쌍을 저장하고 Access Token을 돌려준다', async () => {
    jest.mocked(refreshTokens).mockResolvedValue(newTokens);

    await expect(refreshAccessToken()).resolves.toBe('new-access');

    expect(refreshTokens).toHaveBeenCalledWith('old-refresh');
    expect(saveAuthTokens).toHaveBeenCalledWith(newTokens);
  });

  it('동시에 불려도 갱신 요청은 한 번만 보낸다', async () => {
    jest.mocked(refreshTokens).mockResolvedValue(newTokens);

    const results = await Promise.all([
      refreshAccessToken(),
      refreshAccessToken(),
      refreshAccessToken(),
    ]);

    expect(results).toEqual(['new-access', 'new-access', 'new-access']);
    expect(refreshTokens).toHaveBeenCalledTimes(1);
  });

  it('네트워크 오류면 같은 Refresh Token으로 한 번만 재시도한다', async () => {
    jest
      .mocked(refreshTokens)
      .mockRejectedValueOnce(networkError())
      .mockResolvedValueOnce(newTokens);

    await expect(refreshAccessToken()).resolves.toBe('new-access');

    expect(refreshTokens).toHaveBeenCalledTimes(2);
    expect(refreshTokens).toHaveBeenNthCalledWith(2, 'old-refresh');
  });

  it('재시도도 네트워크 오류면 세션을 유지하고 에러를 전달한다', async () => {
    jest.mocked(refreshTokens).mockRejectedValue(networkError());

    await expect(refreshAccessToken()).rejects.toThrow('Network Error');

    expect(refreshTokens).toHaveBeenCalledTimes(2);
    expect(clearAuthTokens).not.toHaveBeenCalled();
  });

  it('갱신이 401이면 토큰을 지우고 세션 만료를 알린다', async () => {
    jest.mocked(refreshTokens).mockRejectedValue(httpError(401));
    const listener = jest.fn();
    const unsubscribe = onSessionExpired(listener);

    await expect(refreshAccessToken()).rejects.toBeInstanceOf(
      SessionExpiredError,
    );

    expect(clearAuthTokens).toHaveBeenCalled();
    expect(listener).toHaveBeenCalled();
    unsubscribe();
  });

  it('갱신 중에 로그아웃으로 토큰이 지워졌으면 새 토큰을 저장하지 않는다', async () => {
    jest.mocked(getSessionVersion).mockReturnValueOnce(0).mockReturnValue(1);
    jest.mocked(refreshTokens).mockResolvedValue(newTokens);

    await expect(refreshAccessToken()).rejects.toBeInstanceOf(
      SessionExpiredError,
    );

    expect(saveAuthTokens).not.toHaveBeenCalled();
  });

  it('저장된 Refresh Token이 없으면 바로 세션을 만료한다', async () => {
    jest.mocked(getRefreshToken).mockResolvedValue(null);

    await expect(refreshAccessToken()).rejects.toBeInstanceOf(
      SessionExpiredError,
    );

    expect(refreshTokens).not.toHaveBeenCalled();
    expect(clearAuthTokens).toHaveBeenCalled();
  });
});

describe('attachTokenRefresh', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(getRefreshToken).mockResolvedValue('old-refresh');
    jest.mocked(refreshTokens).mockResolvedValue(newTokens);
  });

  // 401을 한 번 준 뒤, 새 Access Token으로 다시 오면 200을 주는 가짜 서버
  function createClient() {
    const seenAuthorization: (string | undefined)[] = [];
    const client = createAxios({
      adapter: async (config) => {
        const authorization = AxiosHeaders.from(config.headers).get(
          'Authorization',
        ) as string | undefined;
        seenAuthorization.push(authorization);
        if (authorization !== 'Bearer new-access') {
          throw httpError(401, config);
        }
        return {
          data: 'ok',
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      },
    });
    attachTokenRefresh(client);
    return { client, seenAuthorization };
  }

  it('401이면 토큰을 갱신하고 원래 요청을 다시 보낸다', async () => {
    const { client, seenAuthorization } = createClient();

    const response = await client.get('/trips', {
      headers: { Authorization: 'Bearer old-access' },
    });

    expect(response.data).toBe('ok');
    expect(seenAuthorization).toEqual([
      'Bearer old-access',
      'Bearer new-access',
    ]);
  });

  it('여러 요청이 동시에 401이어도 갱신은 한 번만 한다', async () => {
    const { client } = createClient();

    const responses = await Promise.all([
      client.get('/a'),
      client.get('/b'),
      client.get('/c'),
    ]);

    expect(responses.map((response) => response.data)).toEqual([
      'ok',
      'ok',
      'ok',
    ]);
    expect(refreshTokens).toHaveBeenCalledTimes(1);
  });

  // axios는 요청마다 config를 새로 만들기 때문에(mergeConfig) 재시도 표시가 새 config에도 남아야 한다
  it('재시도한 요청이 다시 401이면 갱신을 반복하지 않고 실패한다', async () => {
    let memberRequestCount = 0;
    const client = createAxios({
      adapter: async (config) => {
        memberRequestCount += 1;
        // 고치기 전 코드가 무한 반복해도 테스트가 멈추도록 횟수를 제한한다
        if (memberRequestCount > 5) {
          throw new Error('too many requests');
        }
        throw httpError(401, config);
      },
    });
    attachTokenRefresh(client);

    await expect(client.get('/trips')).rejects.toThrow('401');

    expect(refreshTokens).toHaveBeenCalledTimes(1);
    expect(memberRequestCount).toBe(2);
  });

  it('401이 아닌 오류는 갱신하지 않고 그대로 전달한다', async () => {
    const client = createAxios({
      adapter: async (config) => {
        throw httpError(500, config);
      },
    });
    attachTokenRefresh(client);

    await expect(client.get('/trips')).rejects.toThrow('500');

    expect(refreshTokens).not.toHaveBeenCalled();
  });
});
