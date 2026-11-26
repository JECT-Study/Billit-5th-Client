import type {
  TripCountryCode,
  TripCurrency,
} from '@/features/trip/tripCreationForm';
import { canChangeTripCapacity } from '@/features/trip/tripPermission';
import type { TripSummary } from '@/features/trip/tripSummarySchema';

// 여행방 설정 화면의 입력값
export type TripUpdateDraft = {
  name: string;
  countryCode: TripCountryCode;
  customCountryName: string;
  baseCurrency: TripCurrency;
  startDate: string;
  endDate: string;
  memberCapacity: number;
};

// PATCH /api/v1/trips/{tripId} 요청 본문. 바꿀 필드만 보낸다.
export type UpdateTripRequest = {
  name?: string;
  countryCode?: TripCountryCode;
  customCountryName?: string;
  baseCurrency?: TripCurrency;
  startDate?: string;
  endDate?: string;
  memberCapacity?: number;
};

export function toTripUpdateDraft(trip: TripSummary): TripUpdateDraft {
  return {
    name: trip.name,
    countryCode: trip.countryCode,
    customCountryName: trip.customCountryName ?? '',
    baseCurrency: trip.baseCurrency,
    startDate: trip.startDate,
    endDate: trip.endDate,
    memberCapacity: trip.memberCapacity,
  };
}

export function buildTripUpdateRequest(
  original: TripSummary,
  draft: TripUpdateDraft,
): UpdateTripRequest {
  const request: UpdateTripRequest = {};

  const name = draft.name.trim();
  if (name !== original.name) request.name = name;

  const isCountryChanged = draft.countryCode !== original.countryCode;
  if (isCountryChanged) request.countryCode = draft.countryCode;

  // 최종 국가가 ETC일 때만 국가명을 보낸다. ETC를 해제하면 서버가 기존 국가명을 비운다.
  if (draft.countryCode === 'ETC') {
    const customCountryName = draft.customCountryName.trim();
    if (
      isCountryChanged ||
      customCountryName !== (original.customCountryName ?? '')
    ) {
      request.customCountryName = customCountryName;
    }
  }

  if (draft.baseCurrency !== original.baseCurrency) {
    request.baseCurrency = draft.baseCurrency;
  }
  if (draft.startDate !== original.startDate) {
    request.startDate = draft.startDate;
  }
  if (draft.endDate !== original.endDate) request.endDate = draft.endDate;

  // 확정 후에는 인원을 보내면 409이므로 아예 넣지 않는다.
  if (
    canChangeTripCapacity(original) &&
    draft.memberCapacity !== original.memberCapacity
  ) {
    request.memberCapacity = draft.memberCapacity;
  }

  return request;
}

// 필드가 하나도 없는 PATCH는 서버가 400으로 거절한다.
export function hasTripUpdateChanges(request: UpdateTripRequest) {
  return Object.keys(request).length > 0;
}
