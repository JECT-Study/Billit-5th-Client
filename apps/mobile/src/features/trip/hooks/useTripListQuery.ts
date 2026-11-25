import { useInfiniteQuery } from '@tanstack/react-query';

import { tripKeys } from '@/features/trip/tripKeys';
import { listTrips } from '@/features/trip/services/tripApi';
import type { TripListFilter } from '@/features/trip/tripListSchema';

const tripListPageSize = 20;

export function useTripListQuery(
  today: string,
  filter?: TripListFilter,
  session = 0,
) {
  return useInfiniteQuery({
    queryKey: tripKeys.list(today, filter, session),
    queryFn: ({ pageParam }) =>
      listTrips({ today, page: pageParam, size: tripListPageSize, filter }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.page.hasNext ? lastPage.page.page + 1 : undefined,
  });
}
