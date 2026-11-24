import { skipToken, useQuery } from '@tanstack/react-query';

import { getTrip } from '@/features/trip/services/tripApi';
import { tripKeys } from '@/features/trip/tripKeys';
import { parseApiError } from '@/lib/apiError';

const MAX_RETRY_COUNT = 3;

export function shouldRetryTripQuery(failureCount: number, error: unknown) {
  const status = parseApiError(error)?.status;
  if (status === 403 || status === 404) return false;
  return failureCount < MAX_RETRY_COUNT;
}

// tripId가 없으면(라우트 파라미터 누락) 요청하지 않는다.
export function useTripQuery(tripId: string | undefined) {
  return useQuery({
    queryKey: tripKeys.detail(tripId ?? ''),
    queryFn: tripId ? () => getTrip(tripId) : skipToken,
    retry: shouldRetryTripQuery,
  });
}
