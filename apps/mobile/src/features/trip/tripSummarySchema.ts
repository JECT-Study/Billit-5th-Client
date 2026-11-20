import { z } from 'zod';

import {
  TRIP_COUNTRY_CODES,
  TRIP_CURRENCY_CODES,
} from '@/features/trip/tripCreationForm';

// POST /api/v1/trips 응답의 data(TripSummaryResponse)
export const tripSummarySchema = z.object({
  tripId: z.string(),
  name: z.string(),
  countryCode: z.enum(TRIP_COUNTRY_CODES),
  customCountryName: z.string().nullable(),
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  baseCurrency: z.enum(TRIP_CURRENCY_CODES),
  memberCapacity: z.number().int(),
  registeredMemberCount: z.number().int(),
  status: z.enum(['UNCONFIRMED', 'CONFIRMED']),
  myRole: z.enum(['ADMIN', 'MEMBER']),
});

export type TripSummary = z.infer<typeof tripSummarySchema>;
