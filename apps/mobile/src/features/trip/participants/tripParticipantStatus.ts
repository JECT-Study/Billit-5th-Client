import type { TripSummary } from '@/features/trip/tripSummarySchema';
import { parseApiError } from '@/lib/apiError';

export function getParticipantAccessNotice(error: unknown): string | null {
  const status = parseApiError(error)?.status;
  if (status === 404) return '삭제된 여행이에요.';
  if (status === 403) return '이 여행방에 접근할 수 없어요.';
  return null;
}

export function shouldCloseParticipantSheet(
  trip: Pick<TripSummary, 'myRole' | 'status'> | undefined,
  error: unknown,
) {
  return (
    !getParticipantAccessNotice(error) &&
    trip?.myRole === 'MEMBER' &&
    trip.status === 'CONFIRMED'
  );
}
