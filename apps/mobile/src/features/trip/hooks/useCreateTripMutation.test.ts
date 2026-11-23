import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useCreateTripMutation } from '@/features/trip/hooks/useCreateTripMutation';
import { tripKeys } from '@/features/trip/tripKeys';
import { createTrip } from '@/features/trip/services/tripApi';

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('@/features/trip/services/tripApi', () => ({
  createTrip: jest.fn(),
}));

describe('useCreateTripMutation', () => {
  const invalidateQueries = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(useQueryClient).mockReturnValue({
      invalidateQueries,
    } as never);
  });

  it('여행방 생성에 성공하면 모든 여행 목록 캐시를 갱신한다', async () => {
    useCreateTripMutation();

    const options = jest.mocked(useMutation).mock.calls[0]?.[0];
    const onSuccess = options?.onSuccess as
      (() => Promise<unknown>) | undefined;

    expect(options).toMatchObject({ mutationFn: createTrip, retry: false });

    await onSuccess?.();

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: tripKeys.lists(),
    });
  });
});
