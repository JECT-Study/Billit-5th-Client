import type { TripInvitationSearch } from '@/features/trip/invitation/tripInvitationSchema';

export type InviteCodeSearchStatus =
  'ALREADY_JOINED' | 'UNAVAILABLE' | 'JOINABLE';

type SearchResultFields = Pick<
  TripInvitationSearch,
  'isAlreadyJoined' | 'status' | 'registeredMemberCount' | 'memberCapacity'
>;

export function getInviteCodeSearchStatus(
  result: SearchResultFields,
): InviteCodeSearchStatus {
  if (result.isAlreadyJoined) return 'ALREADY_JOINED';
  if (
    result.status === 'CONFIRMED' ||
    result.registeredMemberCount >= result.memberCapacity
  ) {
    return 'UNAVAILABLE';
  }
  return 'JOINABLE';
}

export function formatTripMemberLimit(
  result: Pick<
    TripInvitationSearch,
    'registeredMemberCount' | 'memberCapacity'
  >,
) {
  return `참여 제한 ${result.registeredMemberCount}/${result.memberCapacity}`;
}
