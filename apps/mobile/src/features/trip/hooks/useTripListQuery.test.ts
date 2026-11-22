import { useInfiniteQuery } from '@tanstack/react-query';

import { useTripListQuery } from '@/features/trip/hooks/useTripListQuery';
import { tripKeys } from '@/features/trip/tripKeys';
import { listTrips } from '@/features/trip/services/tripApi';

jest.mock('@tanstack/react-query', () => ({
  useInfiniteQuery: jest.fn(),
}));

jest.mock('@/features/trip/services/tripApi', () => ({
  listTrips: jest.fn(),
}));

function getQueryOptions() {
  const options = jest.mocked(useInfiniteQuery).mock.calls[0]?.[0];
  if (!options) throw new Error('useInfiniteQuery options are missing');
  return options;
}

describe('useTripListQuery', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('전체 여행 목록을 첫 페이지부터 조회한다', async () => {
    useTripListQuery();

    const options = getQueryOptions();
    const queryFn = options.queryFn as ({
      pageParam,
    }: {
      pageParam: number;
    }) => Promise<unknown>;

    await queryFn({ pageParam: 0 });

    expect(options.queryKey).toEqual(tripKeys.list());
    expect(options.initialPageParam).toBe(0);
    expect(listTrips).toHaveBeenCalledWith({ page: 0, size: 20 });
  });

  it('필터별로 별도 쿼리 키와 요청을 사용한다', async () => {
    useTripListQuery('UPCOMING');

    const options = getQueryOptions();
    const queryFn = options.queryFn as ({
      pageParam,
    }: {
      pageParam: number;
    }) => Promise<unknown>;

    await queryFn({ pageParam: 2 });

    expect(options.queryKey).toEqual(tripKeys.list('UPCOMING'));
    expect(listTrips).toHaveBeenCalledWith({
      page: 2,
      size: 20,
      filter: 'UPCOMING',
    });
  });

  it('다음 페이지 존재 여부는 서버 응답의 hasNext를 따른다', () => {
    useTripListQuery();

    const options = getQueryOptions();
    const getNextPageParam = options.getNextPageParam as (lastPage: {
      page: { page: number; hasNext: boolean };
    }) => number | undefined;

    expect(getNextPageParam({ page: { page: 2, hasNext: true } })).toBe(3);
    expect(getNextPageParam({ page: { page: 2, hasNext: false } })).toBe(
      undefined,
    );
  });
});
