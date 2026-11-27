import type { TripSummary } from '@/features/trip/tripSummarySchema';

export function canManageTripParticipants(
  trip: Pick<TripSummary, 'myRole' | 'status'> | undefined,
) {
  return trip?.myRole === 'ADMIN' && trip.status === 'UNCONFIRMED';
}

export function canOpenTrip(
  trip:
    | (Pick<TripSummary, 'myRole' | 'status'> & {
        memberCapacity: number;
        registeredMemberCount: number;
      })
    | undefined,
) {
  return (
    canManageTripParticipants(trip) &&
    trip !== undefined &&
    trip.registeredMemberCount >= trip.memberCapacity
  );
}
