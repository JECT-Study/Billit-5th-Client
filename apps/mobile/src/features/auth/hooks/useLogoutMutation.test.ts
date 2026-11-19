import { useMutation } from '@tanstack/react-query';

import { useLogoutMutation } from '@/features/auth/hooks/useLogoutMutation';
import { logout } from '@/features/auth/services/authApi';
import { clearLocalSession } from '@/features/auth/services/clearLocalSession';

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
}));

jest.mock('@/features/auth/services/authApi', () => ({
  logout: jest.fn(),
}));

jest.mock('@/features/auth/services/clearLocalSession', () => ({
  clearLocalSession: jest.fn(),
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
    expect(options).toMatchObject({ mutationFn: logout, retry: false });

    await onSettled?.(undefined, null);
    await onSettled?.(undefined, new Error('network'));

    expect(clearLocalSession).toHaveBeenCalledTimes(2);
  });
});
