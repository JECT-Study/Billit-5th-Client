import { AxiosError } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  deleteTripIgnoringNotFound,
  useDeleteTripMutation,
} from '@/features/trip/hooks/useDeleteTripMutation';
import { tripKeys } from '@/features/trip/tripKeys';
import { deleteTrip } from '@/features/trip/services/tripApi';

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('@/features/trip/services/tripApi', () => ({
  deleteTrip: jest.fn(),
}));

function toApiError(status: number, code: string) {
  return new AxiosError('error', undefined, undefined, undefined, {
    status,
    data: { code, message: '오류' },
  } as never);
}

describe('deleteTripIgnoringNotFound', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('이미 삭제된 여행(404)은 성공으로 처리한다', async () => {
    jest
      .mocked(deleteTrip)
      .mockRejectedValue(toApiError(404, 'COMMON_NOT_FOUND'));

    await expect(deleteTripIgnoringNotFound('trip-1')).resolves.toBeUndefined();
  });

  it('그 밖의 오류는 그대로 전달한다', async () => {
    const error = toApiError(409, 'TRIP_RECORDS_EXIST');
    jest.mocked(deleteTrip).mockRejectedValue(error);

    await expect(deleteTripIgnoringNotFound('trip-1')).rejects.toBe(error);
  });
});

describe('useDeleteTripMutation', () => {
  const removeQueries = jest.fn();
  const invalidateQueries = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(useQueryClient).mockReturnValue({
      removeQueries,
      invalidateQueries,
    } as never);
  });

  it('성공하면 상세 캐시를 지우고 목록을 무효화한다', async () => {
    useDeleteTripMutation();

    const options = jest.mocked(useMutation).mock.calls[0]?.[0];
    const onSuccess = options?.onSuccess as unknown as (
      data: void,
      tripId: string,
    ) => Promise<unknown>;

    expect(options).toMatchObject({
      mutationFn: deleteTripIgnoringNotFound,
      retry: false,
    });

    await onSuccess(undefined, 'trip-1');

    expect(removeQueries).toHaveBeenCalledWith({
      queryKey: tripKeys.detail('trip-1'),
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: tripKeys.lists(),
    });
  });
});
