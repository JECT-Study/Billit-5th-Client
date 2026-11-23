import { parseApiError } from '@/lib/apiError';

const NICKNAME_DUPLICATED_MESSAGE = '중복된 닉네임입니다.';
const NOT_JOINABLE_MESSAGE = '참여할 수 없는 여행이에요.';
const JOIN_FAILED_MESSAGE = '여행에 참여하지 못했어요. 다시 시도해주세요.';

export type TripJoinErrorResult = {
  message: string;
  shouldLeave: boolean;
  isNicknameError: boolean;
};

export function getTripJoinErrorResult(error: unknown): TripJoinErrorResult {
  const apiError = parseApiError(error);

  if (apiError?.code === 'TRIP_NICKNAME_DUPLICATED') {
    return {
      message: NICKNAME_DUPLICATED_MESSAGE,
      shouldLeave: false,
      isNicknameError: true,
    };
  }
  // 정원 초과·확정·초대 없음 등 다시 시도해도 참여할 수 없는 경우
  if (apiError?.status === 409 || apiError?.status === 404) {
    return {
      message: NOT_JOINABLE_MESSAGE,
      shouldLeave: true,
      isNicknameError: false,
    };
  }
  return {
    message: apiError?.message ?? JOIN_FAILED_MESSAGE,
    shouldLeave: false,
    isNicknameError: false,
  };
}
