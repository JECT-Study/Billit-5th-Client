import type { TripListFilter } from '@/features/trip/list/tripListSchema';

export const tripKeys = {
  all: ['trips'] as const,
  lists: () => [...tripKeys.all, 'list'] as const,
  list: (today: string, filter?: TripListFilter, session = 0) =>
    [...tripKeys.lists(), today, filter ?? 'ALL', session] as const,
  detail: (tripId: string) => [...tripKeys.all, 'detail', tripId] as const,
  invitation: (tripId: string) =>
    [...tripKeys.all, 'invitation', tripId] as const,
};
