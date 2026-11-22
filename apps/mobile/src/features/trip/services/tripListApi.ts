import { apiClient } from '@/lib/api';

import {
  tripListResponseSchema,
  type TripListFilter,
  type TripListResponse,
} from '@/features/trip/tripListSchema';

// TODO: 여행 생성 API가 develop에 병합되면 createTrip과 함께 tripApi.ts로 통합
const tripListPath = '/api/v1/trips';

type ListTripsParams = {
  page?: number;
  size?: number;
  filter?: TripListFilter;
};

export async function listTrips({
  page = 0,
  size = 20,
  filter,
}: ListTripsParams = {}): Promise<TripListResponse> {
  const response = await apiClient.get<unknown>(tripListPath, {
    params: {
      page,
      size,
      ...(filter ? { filter } : {}),
    },
  });

  return tripListResponseSchema.parse(response.data);
}
