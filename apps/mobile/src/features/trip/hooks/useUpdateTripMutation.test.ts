import { AxiosError } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateTripMutation } from '@/features/trip/hooks/useUpdateTripMutation';
import { tripKeys } from '@/features/trip/tripKeys';
import { updateTrip } from '@/features/trip/services/tripApi';

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('@/features/trip/services/tripApi', () => ({
  updateTrip: jest.fn(),
}));

type Variables = { tripId: string; request: object };

function getMutationOptions() {
  const options = jest.mocked(useMutation).mock.calls[0]?.[0];
  if (!options) throw new Error('useMutation options are missing');
  return options as unknown as {
    mutationFn: unknown;
    retry: unknown;
    onSuccess: (trip: object, variables: Variables) => Promise<unknown>;
    onError: (error: unknown, variables: Variables) => unknown;
  };
}

function toApiError(status: number, code: string) {
  return new AxiosError('error', undefined, undefined, undefined, {
    status,
    data: { code, message: '오류' },
  } as never);
}

describe('useUpdateTripMutation', () => {
  const setQueryData = jest.fn();
  const invalidateQueries = jest.fn();
  const variables = { tripId: 'trip-1', request: { name: '새 이름' } };

  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(useQueryClient).mockReturnValue({
      setQueryData,
      invalidateQueries,
    } as never);
  });

  it('재시도하지 않고 updateTrip을 호출한다', () => {
    useUpdateTripMutation();

    expect(getMutationOptions()).toMatchObject({
      mutationFn: updateTrip,
      retry: false,
    });
  });

  it('성공하면 참여자 목록은 두고 상세 캐시를 갱신한 뒤 목록을 무효화한다', async () => {
    useUpdateTripMutation();
    const updated = { tripId: 'trip-1', name: '새 이름' };

    await getMutationOptions().onSuccess(updated, variables);

    expect(setQueryData).toHaveBeenCalledWith(
      tripKeys.detail('trip-1'),
      expect.any(Function),
    );
    const updater = setQueryData.mock.calls[0]?.[1] as (
      previous: object | undefined,
    ) => object | undefined;
    expect(
      updater({ tripId: 'trip-1', name: '이전 이름', participants: ['p'] }),
    ).toEqual({ tripId: 'trip-1', name: '새 이름', participants: ['p'] });
    expect(updater(undefined)).toBeUndefined();
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: tripKeys.lists(),
    });
  });

  it('인원 변경 불가 409를 받으면 상세를 다시 받는다', async () => {
    useUpdateTripMutation();

    await getMutationOptions().onError(
      toApiError(409, 'TRIP_CAPACITY_CHANGE_NOT_ALLOWED'),
      variables,
    );

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: tripKeys.detail('trip-1'),
    });
  });

  it('그 밖의 오류는 캐시를 건드리지 않는다', async () => {
    useUpdateTripMutation();

    await getMutationOptions().onError(
      toApiError(400, 'COMMON_INVALID_REQUEST'),
      variables,
    );

    expect(invalidateQueries).not.toHaveBeenCalled();
  });
});
