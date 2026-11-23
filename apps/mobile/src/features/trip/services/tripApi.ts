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
import {
  tripInvitationSchema,
  tripInvitationSearchSchema,
  tripMembershipSchema,
  type TripInvitation,
  type TripInvitationSearch,
  type TripMembership,
} from '@/features/trip/tripInvitationSchema';

type CreateTripVariables = {
  request: CreateTripRequest;
  idempotencyKey: string;
};

type ListTripsParams = {
  page?: number;
  size?: number;
  filter?: TripListFilter;
};

type JoinTripByInviteCodeVariables = {
  inviteCode: string;
  nickname: string;
};

const tripPath = '/api/v1/trips';
const tripInvitationPath = '/api/v1/trip-invitations';
const tripMembershipPath = '/api/v1/trip-memberships';

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

export async function getTripInvitation(
  tripId: string,
): Promise<TripInvitation> {
  const response = await apiClient.get<{ data: unknown }>(
    `${tripPath}/${encodeURIComponent(tripId)}/invitation`,
  );
  return tripInvitationSchema.parse(response.data.data);
}

export async function searchTripInvitation(
  inviteCode: string,
): Promise<TripInvitationSearch> {
  const response = await apiClient.get<{ data: unknown }>(tripInvitationPath, {
    params: { code: inviteCode },
  });
  return tripInvitationSearchSchema.parse(response.data.data);
}

// 이미 참여 중이면 서버가 기존 참여 정보를 200으로 돌려주므로 멱등성 키를 보내지 않는다.
export async function joinTripByInviteCode({
  inviteCode,
  nickname,
}: JoinTripByInviteCodeVariables): Promise<TripMembership> {
  const response = await apiClient.post<{ data: unknown }>(tripMembershipPath, {
    inviteCode,
    nickname,
  });
  return tripMembershipSchema.parse(response.data.data);
}
