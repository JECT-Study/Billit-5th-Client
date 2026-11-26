import { apiClient } from '@/lib/api';

import type { CreateTripRequest } from '@/features/trip/creation/services/tripCreationRequest';
import type { UpdateTripRequest } from '@/features/trip/settings/services/tripUpdateRequest';
import {
  tripConfirmationSchema,
  tripDetailSchema,
  tripGuestSchema,
  type TripDetail,
} from '@/features/trip/tripDetailSchema';
import {
  tripSummarySchema,
  type TripSummary,
} from '@/features/trip/tripSummarySchema';
import {
  tripListResponseSchema,
  type TripListFilter,
  type TripListResponse,
} from '@/features/trip/list/tripListSchema';
import {
  tripInvitationSchema,
  tripInvitationSearchSchema,
  tripMembershipSchema,
  type TripInvitation,
  type TripInvitationSearch,
  type TripMembership,
} from '@/features/trip/invitation/tripInvitationSchema';

type CreateTripVariables = {
  request: CreateTripRequest;
  idempotencyKey: string;
};

type UpdateTripVariables = {
  tripId: string;
  request: UpdateTripRequest;
};

type ListTripsParams = {
  today: string;
  page?: number;
  size?: number;
  filter?: TripListFilter;
};

type JoinTripByInviteCodeVariables = {
  inviteCode: string;
  tripNickname: string;
};

const tripPath = '/api/v1/trips';
const tripInvitationPath = '/api/v1/trip-invitations';
const tripMembershipPath = '/api/v1/trip-memberships';

export async function saveTripGuest(
  tripId: string,
  tripNickname: string,
  tripMemberId?: string,
) {
  const path = `${getTripPath(tripId)}/guests`;
  const response = tripMemberId
    ? await apiClient.patch<{ data: unknown }>(
        `${path}/${encodeURIComponent(tripMemberId)}`,
        { tripNickname },
      )
    : await apiClient.post<{ data: unknown }>(path, { tripNickname });
  return tripGuestSchema.parse(response.data.data);
}

export async function deleteTripGuest(tripId: string, tripMemberId: string) {
  await apiClient.delete(
    `${getTripPath(tripId)}/guests/${encodeURIComponent(tripMemberId)}`,
  );
}

export async function confirmTrip(tripId: string) {
  const response = await apiClient.post<{ data: unknown }>(
    `${getTripPath(tripId)}/confirm`,
  );
  return tripConfirmationSchema.parse(response.data.data);
}

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
  today,
  page = 0,
  size = 20,
  filter,
}: ListTripsParams): Promise<TripListResponse> {
  const response = await apiClient.get<unknown>(tripPath, {
    params: {
      today,
      page,
      size,
      ...(filter ? { filter } : {}),
    },
  });

  return tripListResponseSchema.parse(response.data);
}

function getTripPath(tripId: string) {
  return `${tripPath}/${encodeURIComponent(tripId)}`;
}

export async function getTrip(tripId: string): Promise<TripDetail> {
  const response = await apiClient.get<{ data: unknown }>(getTripPath(tripId));
  return tripDetailSchema.parse(response.data.data);
}

export async function updateTrip({
  tripId,
  request,
}: UpdateTripVariables): Promise<TripSummary> {
  const response = await apiClient.patch<{ data: unknown }>(
    getTripPath(tripId),
    request,
  );
  return tripSummarySchema.parse(response.data.data);
}

// 성공하면 204로 본문이 없다.
export async function deleteTrip(tripId: string): Promise<void> {
  await apiClient.delete(getTripPath(tripId));
}

export async function getTripInvitation(
  tripId: string,
): Promise<TripInvitation> {
  const response = await apiClient.get<{ data: unknown }>(
    `${getTripPath(tripId)}/invitation`,
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
  tripNickname,
}: JoinTripByInviteCodeVariables): Promise<TripMembership> {
  const response = await apiClient.post<{ data: unknown }>(tripMembershipPath, {
    inviteCode,
    tripNickname,
  });
  return tripMembershipSchema.parse(response.data.data);
}
