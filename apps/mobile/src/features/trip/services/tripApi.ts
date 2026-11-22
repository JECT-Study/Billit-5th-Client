import { apiClient } from '@/lib/api';

import type { CreateTripRequest } from '@/features/trip/services/tripCreationRequest';
import {
  tripSummarySchema,
  type TripSummary,
} from '@/features/trip/tripSummarySchema';

type CreateTripVariables = {
  request: CreateTripRequest;
  idempotencyKey: string;
};

export async function createTrip({
  request,
  idempotencyKey,
}: CreateTripVariables): Promise<TripSummary> {
  const response = await apiClient.post<{ data: unknown }>(
    '/api/v1/trips',
    request,
    { headers: { 'Idempotency-Key': idempotencyKey } },
  );
  return tripSummarySchema.parse(response.data.data);
}
