import { useMutation } from '@tanstack/react-query';

import { createTrip } from '@/features/trip/services/tripApi';

export function useCreateTripMutation() {
  return useMutation({ mutationFn: createTrip, retry: false });
}
