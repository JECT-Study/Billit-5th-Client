import { skipToken, useQuery } from '@tanstack/react-query';

import { tripKeys } from '@/features/trip/tripKeys';
import { getTripInvitation } from '@/features/trip/services/tripApi';

// tripId가 없으면(라우트 파라미터 누락) 요청하지 않는다.
export function useTripInvitationQuery(tripId: string | undefined) {
  return useQuery({
    queryKey: tripKeys.invitation(tripId ?? ''),
    queryFn: tripId ? () => getTripInvitation(tripId) : skipToken,
    // 초대 코드는 재발급되지 않으므로 한 번 받은 값을 계속 쓴다.
    staleTime: Infinity,
    retry: false,
  });
}
