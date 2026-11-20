import { useMutation } from '@tanstack/react-query';

import {
  finishLogout,
  logoutAfterPendingRefresh,
  useLogoutMutation,
} from '@/features/auth/hooks/useLogoutMutation';
import { logout } from '@/features/auth/services/authApi';
import { clearLocalSession } from '@/features/auth/services/clearLocalSession';
import {
  blockRefresh,
  unblockRefresh,
  waitForPendingRefresh,
} from '@/features/auth/services/tokenRefresh';

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
}));

jest.mock('@/features/auth/services/authApi', () => ({
  logout: jest.fn(),
}));

jest.mock('@/features/auth/services/clearLocalSession', () => ({
  clearLocalSession: jest.fn(),
}));

jest.mock('@/features/auth/services/tokenRefresh', () => ({
  blockRefresh: jest.fn(),
  unblockRefresh: jest.fn(),
  waitForPendingRefresh: jest.fn(),
}));

describe('useLogoutMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(clearLocalSession).mockResolvedValue(undefined);
  });

  it('성공이든 401·네트워크 실패든 로컬 세션을 정리한다', async () => {
    useLogoutMutation();

    const options = jest.mocked(useMutation).mock.calls[0]?.[0];
    const onSettled = options?.onSettled as
      ((...args: unknown[]) => Promise<unknown> | unknown) | undefined;
    expect(options).toMatchObject({
      mutationFn: logoutAfterPendingRefresh,
      retry: false,
      onSettled: finishLogout,
    });

    await onSettled?.(undefined, null);
    await onSettled?.(undefined, new Error('network'));

    expect(clearLocalSession).toHaveBeenCalledTimes(2);
  });

  it('새 갱신을 먼저 막고, 진행 중인 갱신이 끝난 뒤 서버 로그아웃을 요청한다', async () => {
    const order: string[] = [];
    jest.mocked(blockRefresh).mockImplementation(() => {
      order.push('block');
    });
    jest.mocked(waitForPendingRefresh).mockImplementation(async () => {
      order.push('wait');
    });
    jest.mocked(logout).mockImplementation(async () => {
      order.push('logout');
    });

    await logoutAfterPendingRefresh();

    expect(order).toEqual(['block', 'wait', 'logout']);
    expect(unblockRefresh).not.toHaveBeenCalled();
  });

  it('로컬 세션을 지운 뒤에 갱신 차단을 푼다', async () => {
    const order: string[] = [];
    jest.mocked(clearLocalSession).mockImplementation(async () => {
      order.push('clear');
    });
    jest.mocked(unblockRefresh).mockImplementation(() => {
      order.push('unblock');
    });

    await finishLogout();

    expect(order).toEqual(['clear', 'unblock']);
  });

  it('로컬 세션 정리가 실패해도 갱신 차단을 푼다', async () => {
    jest
      .mocked(clearLocalSession)
      .mockRejectedValue(new Error('storage failed'));

    await expect(finishLogout()).rejects.toThrow('storage failed');

    expect(unblockRefresh).toHaveBeenCalledTimes(1);
  });
});
