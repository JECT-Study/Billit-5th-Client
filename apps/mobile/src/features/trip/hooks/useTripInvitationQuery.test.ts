import { skipToken, useQuery } from '@tanstack/react-query';

import { useTripInvitationQuery } from '@/features/trip/hooks/useTripInvitationQuery';
import { tripKeys } from '@/features/trip/tripKeys';
import { getTripInvitation } from '@/features/trip/services/tripApi';

jest.mock('@tanstack/react-query', () => ({
  skipToken: Symbol('skipToken'),
  useQuery: jest.fn(),
}));

jest.mock('@/features/trip/services/tripApi', () => ({
  getTripInvitation: jest.fn(),
}));

function getQueryOptions() {
  const options = jest.mocked(useQuery).mock.calls[0]?.[0];
  if (!options) throw new Error('useQuery options are missing');
  return options;
}

describe('useTripInvitationQuery', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('여행방별 키로 초대 정보를 한 번만 조회하고 실패해도 재시도하지 않는다', async () => {
    useTripInvitationQuery('trip-1');

    const options = getQueryOptions();
    const queryFn = options.queryFn as () => Promise<unknown>;

    await queryFn();

    expect(options).toMatchObject({
      queryKey: tripKeys.invitation('trip-1'),
      staleTime: Infinity,
      retry: false,
    });
    expect(getTripInvitation).toHaveBeenCalledWith('trip-1');
  });

  it('tripId가 없으면 요청하지 않는다', () => {
    useTripInvitationQuery(undefined);

    expect(getQueryOptions().queryFn).toBe(skipToken);
  });
});
