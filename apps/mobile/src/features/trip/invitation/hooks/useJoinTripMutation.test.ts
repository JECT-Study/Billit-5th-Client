import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useJoinTripMutation } from '@/features/trip/invitation/hooks/useJoinTripMutation';
import { tripKeys } from '@/features/trip/tripKeys';
import { joinTripByInviteCode } from '@/features/trip/services/tripApi';

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('@/features/trip/services/tripApi', () => ({
  joinTripByInviteCode: jest.fn(),
}));

describe('useJoinTripMutation', () => {
  const invalidateQueries = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(useQueryClient).mockReturnValue({
      invalidateQueries,
    } as never);
  });

  it('여행 참여에 성공하면 모든 여행 목록 캐시를 갱신한다', async () => {
    useJoinTripMutation();

    const options = jest.mocked(useMutation).mock.calls[0]?.[0];
    const onSuccess = options?.onSuccess as
      (() => Promise<unknown>) | undefined;

    expect(options).toMatchObject({
      mutationFn: joinTripByInviteCode,
      retry: false,
    });

    await onSuccess?.();

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: tripKeys.lists(),
    });
  });
});
