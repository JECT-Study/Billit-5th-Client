import { parseApiError } from '@/lib/apiError';

import type { TripInvitation } from '@/features/trip/tripInvitationSchema';

// 관리자가 아니거나(403) 이미 확정된 여행(409)은 다시 요청해도 공유할 수 없다.
const NOT_SHAREABLE_STATUSES = new Set([403, 409]);

export function canShareInvitation(error: unknown) {
  if (!error) return true;
  const status = parseApiError(error)?.status;
  return status == null || !NOT_SHAREABLE_STATUSES.has(status);
}

export function formatInvitationShareMessage({
  inviteCode,
  inviteUrl,
}: TripInvitation) {
  return `Billit 초대 코드: ${inviteCode}\n${inviteUrl}`;
}
