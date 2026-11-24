import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteTrip } from '@/features/trip/services/tripApi';
import { tripKeys } from '@/features/trip/tripKeys';
import { parseApiError } from '@/lib/apiError';

// 응답을 받지 못해 다시 보낸 삭제 요청은 이미 지워진 여행이라 404를 받는다
export async function deleteTripIgnoringNotFound(tripId: string) {
  try {
    await deleteTrip(tripId);
  } catch (error) {
    if (parseApiError(error)?.status === 404) return;
    throw error;
  }
}

export function useDeleteTripMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTripIgnoringNotFound,
    retry: false,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: tripKeys.lists() }),
  });
}
