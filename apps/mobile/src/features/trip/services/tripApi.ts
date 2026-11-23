import { apiClient } from '@/lib/api';

import type { CreateTripRequest } from '@/features/trip/services/tripCreationRequest';
import {
  tripSummarySchema,
  type TripSummary,
} from '@/features/trip/tripSummarySchema';
import {
  tripListResponseSchema,
  type TripListFilter,
  type TripListResponse,
} from '@/features/trip/tripListSchema';

type CreateTripVariables = {
  request: CreateTripRequest;
  idempotencyKey: string;
};

type ListTripsParams = {
  page?: number;
  size?: number;
  filter?: TripListFilter;
};

const tripPath = '/api/v1/trips';

export async function createTrip({
  request,
  idempotencyKey,
}: CreateTripVariables): Promise<TripSummary> {
  const response = await apiClient.post<{ data: unknown }>(tripPath, request, {
    headers: { 'Idempotency-Key': idempotencyKey },
  });
  return tripSummarySchema.parse(response.data.data);
}

export async function listTrips({
  page = 0,
  size = 20,
  filter,
}: ListTripsParams = {}): Promise<TripListResponse> {
  const response = await apiClient.get<unknown>(tripPath, {
    params: {
      page,
      size,
      ...(filter ? { filter } : {}),
    },
  });

  return tripListResponseSchema.parse(response.data);
}
