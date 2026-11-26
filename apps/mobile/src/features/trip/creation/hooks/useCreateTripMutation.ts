import { useMutation, useQueryClient } from '@tanstack/react-query';

import { tripKeys } from '@/features/trip/tripKeys';
import { createTrip } from '@/features/trip/services/tripApi';

export function useCreateTripMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTrip,
    retry: false,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: tripKeys.lists() }),
  });
}
