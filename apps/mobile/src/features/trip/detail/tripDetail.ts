import type { TripDetail } from '@/features/trip/tripDetailSchema';
import { canOpenTripDetail } from '@/features/trip/tripPermission';
import {
  DELETED_TRIP_NOTICE,
  LOAD_FAILED_MESSAGE,
  NO_ACCESS_MESSAGE,
  type TripSettingsNotice,
} from '@/features/trip/settings/tripSettings';
import { parseApiError } from '@/lib/apiError';

// 설정 화면과 같은 모양(안내 문구 + 떠날 곳)을 쓴다. 상세 화면은 항상 떠난다.
export type TripDetailNotice = TripSettingsNotice;

// 설정 화면과 달리 403도 여행 목록으로 보낸다. 상세는 여행방의 입구라 뒤로 가도 갈 곳이 없다.
export const NO_ACCESS_TRIP_NOTICE: TripDetailNotice = {
  message: NO_ACCESS_MESSAGE,
  exitTo: 'trips',
};

export const UNCONFIRMED_TRIP_NOTICE: TripDetailNotice = {
  message: '아직 시작하지 않은 여행이에요.',
  exitTo: 'trips',
};

// 여행 상세 조회(GET) 실패
export function getTripDetailLoadErrorNotice(error: unknown): TripDetailNotice {
  const apiError = parseApiError(error);

  if (apiError?.status === 404) return DELETED_TRIP_NOTICE;
  if (apiError?.status === 403) return NO_ACCESS_TRIP_NOTICE;
  return { message: apiError?.message ?? LOAD_FAILED_MESSAGE, exitTo: 'back' };
}

type TripDetailQueryState = {
  tripId: string | undefined;
  trip: TripDetail | undefined;
  error: unknown;
};

export function getTripDetailNotice({
  tripId,
  trip,
  error,
}: TripDetailQueryState): TripDetailNotice | null {
  if (!tripId) return DELETED_TRIP_NOTICE;
  if (trip) return canOpenTripDetail(trip) ? null : UNCONFIRMED_TRIP_NOTICE;
  if (error) return getTripDetailLoadErrorNotice(error);
  return null;
}
