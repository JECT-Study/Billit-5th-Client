import { z } from 'zod';

export const tripScheduleStatusSchema = z.enum([
  'INVITING',
  'UPCOMING',
  'ONGOING',
  'ENDED',
]);

export const tripListFilterSchema = tripScheduleStatusSchema;

export const tripListItemSchema = z.object({
  tripId: z.string(),
  name: z.string(),
  countryCode: z.string(),
  customCountryName: z.string().nullable(),
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  memberCapacity: z.number().int().positive(),
  registeredMemberCount: z.number().int().nonnegative(),
  status: z.enum(['UNCONFIRMED', 'CONFIRMED']),
  scheduleStatus: tripScheduleStatusSchema,
  myRole: z.enum(['ADMIN', 'MEMBER']),
  myShareAmountKrw: z.string().regex(/^-?(0|[1-9]\d*)\.\d{2}$/),
});

export const tripListPageSchema = z.object({
  page: z.number().int().nonnegative(),
  size: z.number().int().positive().max(100),
  totalElements: z.number().int().nonnegative(),
  hasNext: z.boolean(),
});

// GET /api/v1/trips 응답 전체
export const tripListResponseSchema = z.object({
  data: z.array(tripListItemSchema),
  page: tripListPageSchema,
});

export type TripListFilter = z.infer<typeof tripListFilterSchema>;
export type TripScheduleStatus = z.infer<typeof tripScheduleStatusSchema>;
export type TripListItem = z.infer<typeof tripListItemSchema>;
export type TripListPage = z.infer<typeof tripListPageSchema>;
export type TripListResponse = z.infer<typeof tripListResponseSchema>;
