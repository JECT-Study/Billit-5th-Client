import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

import { useTripListQuery } from '@/features/trip/list/hooks/useTripListQuery';
import { tripKeys } from '@/features/trip/tripKeys';
import { listTrips } from '@/features/trip/services/tripApi';

jest.mock('@tanstack/react-query', () => ({
  useInfiniteQuery: jest.fn(),
  useQueryClient: jest.fn(),
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
  const today = '2026-11-24';
  const findAll = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(useInfiniteQuery).mockReturnValue({
      data: undefined,
      isError: false,
      isPlaceholderData: false,
    } as never);
    findAll.mockReturnValue([]);
    jest.mocked(useQueryClient).mockReturnValue({
      getQueryCache: () => ({ findAll }),
    } as never);
  });

  it('전체 여행 목록을 첫 페이지부터 조회한다', async () => {
    useTripListQuery(today);

    const options = getQueryOptions();
    const queryFn = options.queryFn as ({
      pageParam,
    }: {
      pageParam: number;
    }) => Promise<unknown>;

    await queryFn({ pageParam: 0 });

    expect(options.queryKey).toEqual(tripKeys.list(today));
    expect(options.initialPageParam).toBe(0);
    expect(listTrips).toHaveBeenCalledWith({ today, page: 0, size: 20 });
  });

  it('필터별로 별도 쿼리 키와 요청을 사용한다', async () => {
    useTripListQuery(today, 'UPCOMING');

    const options = getQueryOptions();
    const queryFn = options.queryFn as ({
      pageParam,
    }: {
      pageParam: number;
    }) => Promise<unknown>;

    await queryFn({ pageParam: 2 });

    expect(options.queryKey).toEqual(tripKeys.list(today, 'UPCOMING'));
    expect(listTrips).toHaveBeenCalledWith({
      today,
      page: 2,
      size: 20,
      filter: 'UPCOMING',
    });
  });

  it('다음 페이지 존재 여부는 서버 응답의 hasNext를 따른다', () => {
    useTripListQuery(today);

    const options = getQueryOptions();
    const getNextPageParam = options.getNextPageParam as (lastPage: {
      page: { page: number; hasNext: boolean };
    }) => number | undefined;

    expect(getNextPageParam({ page: { page: 2, hasNext: true } })).toBe(3);
    expect(getNextPageParam({ page: { page: 2, hasNext: false } })).toBe(
      undefined,
    );
  });

  it('새 조회 세션은 같은 날짜와 필터여도 별도 캐시를 사용한다', () => {
    expect(tripKeys.list(today, 'ONGOING', 1)).not.toEqual(
      tripKeys.list(today, 'ONGOING', 2),
    );
  });

  it('같은 필터 재조회 중에는 이전 목록을 유지하고 다른 필터에서는 사용하지 않는다', () => {
    useTripListQuery(today, 'UPCOMING', 2);
    const placeholderData = getQueryOptions().placeholderData as (
      data: unknown,
      query: { queryKey: readonly unknown[] },
    ) => unknown;
    const previous = { pages: [{ data: ['이전 여행'] }], pageParams: [0] };

    expect(
      placeholderData(previous, {
        queryKey: tripKeys.list(today, 'UPCOMING', 1),
      }),
    ).toBe(previous);
    expect(
      placeholderData(previous, { queryKey: tripKeys.list(today, 'ENDED', 1) }),
    ).toBeUndefined();
  });

  it('재조회 실패 시 같은 필터의 가장 최근 목록을 유지한다', () => {
    const previous = { pages: [{ data: ['이전 여행'] }], pageParams: [0] };
    findAll.mockReturnValue([
      {
        queryKey: tripKeys.list(today, 'UPCOMING', 1),
        state: { data: previous, dataUpdatedAt: 5 },
      },
      {
        queryKey: tripKeys.list(today, 'ENDED', 1),
        state: { data: { pages: [] }, dataUpdatedAt: 10 },
      },
    ]);
    jest.mocked(useInfiniteQuery).mockReturnValue({
      data: undefined,
      isError: true,
      isPlaceholderData: false,
    } as never);

    const result = useTripListQuery(today, 'UPCOMING', 2);

    expect(result.data).toBe(previous);
    expect(result.isShowingPreviousData).toBe(true);
  });
});
