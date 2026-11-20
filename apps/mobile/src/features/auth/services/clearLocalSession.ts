import { queryClient } from '@/lib/queryClient';

import { clearAuthTokens } from '@/features/auth/services/authStorage';
import { notifySessionExpired } from '@/features/auth/services/sessionEvents';

// 토큰과 조회 캐시를 지운 뒤, 루트 레이아웃이 로그인 화면으로 보내게 알린다.
// Refresh Token까지 지워지므로 앱을 다시 켜면 로그인 화면에서 시작한다.
// 토큰 삭제가 실패해도 캐시를 비우고 로그인 화면으로 보낸다.
export async function clearLocalSession() {
  try {
    await clearAuthTokens();
  } finally {
    queryClient.clear();
    notifySessionExpired();
  }
}
