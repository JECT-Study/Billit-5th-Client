import type { TripSummary } from '@/features/trip/tripSummarySchema';

type TripAccess = Pick<TripSummary, 'myRole' | 'status'>;

export function canOpenTripDetail(trip: Pick<TripAccess, 'status'>) {
  return trip.status === 'CONFIRMED';
}

export function canEditTrip(trip: TripAccess) {
  return trip.myRole === 'ADMIN';
}

export function canChangeTripCapacity(trip: TripAccess) {
  return canEditTrip(trip) && trip.status === 'UNCONFIRMED';
}

export function canDeleteTrip(trip: TripAccess) {
  return canEditTrip(trip);
}

export function canAddExpense(trip: Pick<TripAccess, 'status'>) {
  return trip.status === 'CONFIRMED';
}

export function canStartSettlement(trip: TripAccess) {
  return trip.myRole === 'ADMIN' && trip.status === 'CONFIRMED';
}
