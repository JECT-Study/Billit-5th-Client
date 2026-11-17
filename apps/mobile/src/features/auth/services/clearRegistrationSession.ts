import { queryClient } from '@/lib/queryClient';

import { registrationKeys } from '@/features/auth/queries/registrationKeys';
import { setRegistrationToken } from '@/features/auth/services/authStorage';

// 가입 토큰과 가입 조회 캐시를 함께 지운다.
export function clearRegistrationSession() {
  setRegistrationToken(null);
  queryClient.removeQueries({ queryKey: registrationKeys.all });
}
