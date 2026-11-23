import { useMutation } from '@tanstack/react-query';

import { searchTripInvitation } from '@/features/trip/services/tripApi';

export function useSearchTripInvitationMutation() {
  return useMutation({
    mutationFn: searchTripInvitation,
    retry: false,
  });
}
