import { useMutation, useQueryClient } from '@tanstack/react-query';

import { tripKeys } from '@/features/trip/tripKeys';
import { joinTripByInviteCode } from '@/features/trip/services/tripApi';

export function useJoinTripMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: joinTripByInviteCode,
    retry: false,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: tripKeys.lists() }),
  });
}
