import { parseApiError } from '@/lib/apiError';

export type TripSettingsExit = 'back' | 'trips' | null;

export type TripSettingsNotice = {
  message: string;
  exitTo: TripSettingsExit;
};

const DELETED_TRIP_MESSAGE = '삭제된 여행이에요.';
const NO_ACCESS_MESSAGE = '이 여행방에 접근할 수 없어요.';
const ADMIN_ONLY_MESSAGE = '여행 관리자만 여행방을 설정할 수 있어요.';
const LOAD_FAILED_MESSAGE = '여행 정보를 불러오지 못했어요. 다시 시도해주세요.';
const SAVE_FAILED_MESSAGE = '여행 정보를 저장하지 못했어요. 다시 시도해주세요.';
const CAPACITY_LOCKED_MESSAGE = '지금은 여행 총인원을 바꿀 수 없어요.';

export const ADMIN_ONLY_NOTICE: TripSettingsNotice = {
  message: ADMIN_ONLY_MESSAGE,
  exitTo: 'back',
};

export const DELETED_TRIP_NOTICE: TripSettingsNotice = {
  message: DELETED_TRIP_MESSAGE,
  exitTo: 'trips',
};

// 여행 상세 조회(GET) 실패
export function getTripLoadErrorNotice(error: unknown): TripSettingsNotice {
  const apiError = parseApiError(error);

  if (apiError?.status === 404) return DELETED_TRIP_NOTICE;
  if (apiError?.status === 403) {
    return { message: NO_ACCESS_MESSAGE, exitTo: 'back' };
  }
  return { message: apiError?.message ?? LOAD_FAILED_MESSAGE, exitTo: 'back' };
}

// 여행 정보 수정(PATCH) 실패
export function getTripUpdateErrorNotice(error: unknown): TripSettingsNotice {
  const apiError = parseApiError(error);

  if (apiError?.status === 404) return DELETED_TRIP_NOTICE;
  if (apiError?.status === 403) return ADMIN_ONLY_NOTICE;
  if (apiError?.code === 'TRIP_CAPACITY_CHANGE_NOT_ALLOWED') {
    return {
      message: apiError.message ?? CAPACITY_LOCKED_MESSAGE,
      exitTo: null,
    };
  }
  return { message: apiError?.message ?? SAVE_FAILED_MESSAGE, exitTo: null };
}
