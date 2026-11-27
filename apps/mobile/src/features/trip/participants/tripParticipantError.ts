import { parseApiError } from '@/lib/apiError';

export function participantErrorMessage(error: unknown) {
  const parsed = parseApiError(error);
  switch (parsed?.code) {
    case 'TRIP_NICKNAME_DUPLICATED':
      return '이미 사용 중인 닉네임이에요.';
    case 'TRIP_CAPACITY_FULL':
      return '참여 인원이 가득 찼어요.';
    case 'TRIP_ALREADY_CONFIRMED':
      return '이미 시작된 여행방이에요.';
    default:
      return parsed?.message ?? '요청을 처리하지 못했어요. 다시 시도해주세요.';
  }
}
