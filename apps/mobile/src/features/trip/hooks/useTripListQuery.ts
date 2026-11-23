import { useInfiniteQuery } from '@tanstack/react-query';

import { tripKeys } from '@/features/trip/tripKeys';
import { listTrips } from '@/features/trip/services/tripApi';
import type { TripListFilter } from '@/features/trip/tripListSchema';

const tripListPageSize = 20;

export function useTripListQuery(filter?: TripListFilter) {
  return useInfiniteQuery({
    queryKey: tripKeys.list(filter),
    queryFn: ({ pageParam }) =>
      listTrips({ page: pageParam, size: tripListPageSize, filter }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.page.hasNext ? lastPage.page.page + 1 : undefined,
  });
}
