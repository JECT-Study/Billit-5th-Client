import type { TripListFilter } from '@/features/trip/tripListSchema';

export const tripKeys = {
  all: ['trips'] as const,
  lists: () => [...tripKeys.all, 'list'] as const,
  list: (filter?: TripListFilter) =>
    [...tripKeys.lists(), filter ?? 'ALL'] as const,
  invitation: (tripId: string) =>
    [...tripKeys.all, 'invitation', tripId] as const,
};
