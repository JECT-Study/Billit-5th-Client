import type { TripSummary } from '@/features/trip/tripSummarySchema';

type TripAccess = Pick<TripSummary, 'myRole' | 'status'>;

export function canEditTrip(trip: TripAccess) {
  return trip.myRole === 'ADMIN';
}

export function canChangeTripCapacity(trip: TripAccess) {
  return canEditTrip(trip) && trip.status === 'UNCONFIRMED';
}

export function canDeleteTrip(trip: TripAccess) {
  return canEditTrip(trip);
}

export function canStartSettlement(trip: TripAccess) {
  return trip.myRole === 'ADMIN' && trip.status === 'CONFIRMED';
}
