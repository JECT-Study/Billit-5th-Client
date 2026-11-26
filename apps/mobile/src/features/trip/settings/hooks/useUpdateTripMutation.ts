import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateTrip } from '@/features/trip/services/tripApi';
import type { TripDetail } from '@/features/trip/tripDetailSchema';
import { tripKeys } from '@/features/trip/tripKeys';
import { parseApiError } from '@/lib/apiError';

export function useUpdateTripMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTrip,
    retry: false,
    onSuccess: (trip, { tripId }) => {
      // 수정 응답에는 참여자 목록이 없으므로 기존 상세의 participants를 유지
      queryClient.setQueryData<TripDetail>(
        tripKeys.detail(tripId),
        (previous) => (previous ? { ...previous, ...trip } : previous),
      );
      return queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
    },
    onError: (error, { tripId }) => {
      // 그사이 여행이 확정됐거나 인원이 늘었으므로 최신 상세를 다시 받는다
      if (parseApiError(error)?.code === 'TRIP_CAPACITY_CHANGE_NOT_ALLOWED') {
        return queryClient.invalidateQueries({
          queryKey: tripKeys.detail(tripId),
        });
      }
    },
  });
}
