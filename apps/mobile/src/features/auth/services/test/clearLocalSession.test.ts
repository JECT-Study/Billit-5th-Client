import { queryClient } from '@/lib/queryClient';

import { clearLocalSession } from '@/features/auth/services/clearLocalSession';
import { clearAuthTokens } from '@/features/auth/services/authStorage';
import { onSessionExpired } from '@/features/auth/services/sessionEvents';

jest.mock('@/features/auth/services/authStorage', () => ({
  clearAuthTokens: jest.fn(),
}));

const previousUser = { id: 'previous-user' };

describe('clearLocalSession', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(clearAuthTokens).mockResolvedValue(undefined);
    queryClient.clear();
    queryClient.setQueryData(['me'], previousUser);
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('토큰을 지운 다음 캐시를 비우고 로그인 화면으로 이동하라고 알린다', async () => {
    jest.mocked(clearAuthTokens).mockImplementation(async () => {
      expect(queryClient.getQueryData(['me'])).toEqual(previousUser);
    });
    const listener = jest.fn(() => {
      expect(queryClient.getQueryData(['me'])).toBeUndefined();
    });
    const unsubscribe = onSessionExpired(listener);

    await clearLocalSession();

    expect(clearAuthTokens).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('토큰 삭제가 실패해도 캐시를 비우고 로그인 화면으로 이동하라고 알린다', async () => {
    jest
      .mocked(clearAuthTokens)
      .mockRejectedValue(new Error('SecureStore error'));
    const listener = jest.fn();
    const unsubscribe = onSessionExpired(listener);

    await expect(clearLocalSession()).rejects.toThrow('SecureStore error');

    expect(queryClient.getQueryData(['me'])).toBeUndefined();
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });
});
