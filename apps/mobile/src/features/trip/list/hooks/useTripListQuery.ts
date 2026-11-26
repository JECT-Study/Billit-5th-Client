import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';

import { tripKeys } from '@/features/trip/tripKeys';
import { listTrips } from '@/features/trip/services/tripApi';
import type {
  TripListFilter,
  TripListResponse,
} from '@/features/trip/list/tripListSchema';

const tripListPageSize = 20;

export function useTripListQuery(
  today: string,
  filter?: TripListFilter,
  session = 0,
) {
  const queryClient = useQueryClient();
  const filterKey = filter ?? 'ALL';
  const query = useInfiniteQuery({
    queryKey: tripKeys.list(today, filter, session),
    queryFn: ({ pageParam }) =>
      listTrips({ today, page: pageParam, size: tripListPageSize, filter }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.page.hasNext ? lastPage.page.page + 1 : undefined,
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[3] === filterKey ? previousData : undefined,
  });

  // 새 세션 조회가 실패하면 같은 필터의 마지막 성공 결과를 유지한다.
  const cachedData =
    query.isError && !query.data
      ? (queryClient
          .getQueryCache()
          .findAll({ queryKey: tripKeys.lists() })
          .filter((item) => item.queryKey[3] === filterKey && item.state.data)
          .sort((a, b) => b.state.dataUpdatedAt - a.state.dataUpdatedAt)[0]
          ?.state.data as InfiniteData<TripListResponse> | undefined)
      : undefined;

  return {
    ...query,
    data: query.data ?? cachedData,
    isShowingPreviousData: query.isPlaceholderData || cachedData !== undefined,
  };
}
