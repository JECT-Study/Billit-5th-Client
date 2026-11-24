import { AxiosError } from 'axios';
import { skipToken, useQuery } from '@tanstack/react-query';

import {
  shouldRetryTripQuery,
  useTripQuery,
} from '@/features/trip/hooks/useTripQuery';
import { tripKeys } from '@/features/trip/tripKeys';
import { getTrip } from '@/features/trip/services/tripApi';

jest.mock('@tanstack/react-query', () => ({
  skipToken: Symbol('skipToken'),
  useQuery: jest.fn(),
}));

jest.mock('@/features/trip/services/tripApi', () => ({
  getTrip: jest.fn(),
}));

function getQueryOptions() {
  const options = jest.mocked(useQuery).mock.calls[0]?.[0];
  if (!options) throw new Error('useQuery options are missing');
  return options;
}

function toAxiosError(status: number) {
  return new AxiosError('error', undefined, undefined, undefined, {
    status,
    data: {},
  } as never);
}

describe('useTripQuery', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('여행별 상세 키로 여행을 조회한다', async () => {
    useTripQuery('trip-1');

    const options = getQueryOptions();
    await (options.queryFn as () => Promise<unknown>)();

    expect(options.queryKey).toEqual(tripKeys.detail('trip-1'));
    expect(getTrip).toHaveBeenCalledWith('trip-1');
  });

  it('tripId가 없으면 요청하지 않는다', () => {
    useTripQuery(undefined);

    expect(getQueryOptions().queryFn).toBe(skipToken);
  });
});

describe('shouldRetryTripQuery', () => {
  it.each([403, 404])('%s 오류는 재시도하지 않는다', (status) => {
    expect(shouldRetryTripQuery(0, toAxiosError(status))).toBe(false);
  });

  it('그 밖의 오류는 3번까지 재시도한다', () => {
    const error = toAxiosError(500);

    expect(shouldRetryTripQuery(2, error)).toBe(true);
    expect(shouldRetryTripQuery(3, error)).toBe(false);
  });
});
