import type { TripUpdateDraft } from '@/features/trip/settings/services/tripUpdateRequest';
import {
  countryStepSchema,
  currencyStepSchema,
  dateStepSchema,
  nameStepSchema,
} from '@/features/trip/shared/tripCreationSchema';
import { canChangeTripCapacity } from '@/features/trip/tripPermission';
import type { TripSummary } from '@/features/trip/tripSummarySchema';

export const MAX_TRIP_MEMBER_CAPACITY = 10;

// 이름·국가·통화·기간은 여행 생성과 같은 규칙을 쓴다.
const tripUpdateFieldsSchema = nameStepSchema
  .and(countryStepSchema)
  .and(currencyStepSchema)
  .and(dateStepSchema);

export function isTripMemberCapacityValid(
  memberCapacity: number,
  registeredMemberCount: number,
) {
  return (
    Number.isInteger(memberCapacity) &&
    memberCapacity >= Math.max(1, registeredMemberCount) &&
    memberCapacity <= MAX_TRIP_MEMBER_CAPACITY
  );
}

export function isTripUpdateDraftValid(
  trip: TripSummary,
  draft: TripUpdateDraft,
) {
  if (!tripUpdateFieldsSchema.safeParse(draft).success) return false;
  if (!canChangeTripCapacity(trip)) return true;
  return isTripMemberCapacityValid(
    draft.memberCapacity,
    trip.registeredMemberCount,
  );
}
