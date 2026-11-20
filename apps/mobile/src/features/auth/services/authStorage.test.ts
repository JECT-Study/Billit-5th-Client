import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  getSessionVersion,
  saveAuthTokens,
  saveAuthTokensIfVersion,
} from '@/features/auth/services/authStorage';

// 값은 호출 즉시 바뀌고 완료는 다음 틱에 알린다.
// 실제 저장소처럼 await 사이에 다른 작업이 끼어들 틈을 만든다.
const mockStore = new Map<string, string>();

function mockNextTick() {
  return new Promise<void>((resolve) => setTimeout(resolve, 0));
}

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (key: string) => mockStore.get(key) ?? null),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    mockStore.set(key, value);
    await mockNextTick();
  }),
  deleteItemAsync: jest.fn(async (key: string) => {
    mockStore.delete(key);
    await mockNextTick();
  }),
}));

const newTokens = { accessToken: 'new-access', refreshToken: 'new-refresh' };

async function expectNoTokens() {
  await expect(getAccessToken()).resolves.toBeNull();
  await expect(getRefreshToken()).resolves.toBeNull();
}

describe('authStorage', () => {
  beforeEach(() => {
    mockStore.clear();
  });

  it('저장 중에 삭제가 요청되면 저장이 끝난 뒤 삭제해 토큰이 남지 않는다', async () => {
    const saving = saveAuthTokens(newTokens);
    const clearing = clearAuthTokens();

    await Promise.all([saving, clearing]);

    await expectNoTokens();
  });

  it('버전이 그대로면 토큰 쌍을 저장한다', async () => {
    const version = getSessionVersion();

    await expect(saveAuthTokensIfVersion(newTokens, version)).resolves.toBe(
      true,
    );

    await expect(getAccessToken()).resolves.toBe('new-access');
    await expect(getRefreshToken()).resolves.toBe('new-refresh');
  });

  it('확인 전에 삭제가 먼저 잡히면 저장하지 않는다', async () => {
    const version = getSessionVersion();

    const clearing = clearAuthTokens();
    const saving = saveAuthTokensIfVersion(newTokens, version);

    await clearing;
    await expect(saving).resolves.toBe(false);
    await expectNoTokens();
  });

  it('확인·저장 중에 삭제가 요청되면 저장이 끝난 뒤 삭제한다', async () => {
    const version = getSessionVersion();

    const saving = saveAuthTokensIfVersion(newTokens, version);
    const clearing = clearAuthTokens();

    await expect(saving).resolves.toBe(true);
    await clearing;
    await expectNoTokens();
  });

  it('앞 작업이 실패해도 다음 작업은 실행된다', async () => {
    const SecureStore = jest.requireMock('expo-secure-store') as {
      setItemAsync: jest.Mock;
    };
    SecureStore.setItemAsync.mockRejectedValueOnce(new Error('write failed'));

    await expect(saveAuthTokens(newTokens)).rejects.toThrow('write failed');
    await expect(clearAuthTokens()).resolves.toBeUndefined();
  });

  it('삭제할 때마다 세션 버전을 올린다', async () => {
    const before = getSessionVersion();

    await clearAuthTokens();

    expect(getSessionVersion()).toBe(before + 1);
  });
});
