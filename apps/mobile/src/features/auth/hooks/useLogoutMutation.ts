import { useMutation } from '@tanstack/react-query';

import { logout } from '@/features/auth/services/authApi';
import { clearLocalSession } from '@/features/auth/services/clearLocalSession';
import {
  blockRefresh,
  unblockRefresh,
  waitForPendingRefresh,
} from '@/features/auth/services/tokenRefresh';

// 새 갱신을 먼저 막고, 진행 중인 갱신이 끝난 뒤 최신 토큰으로 서버 로그아웃을 요청한다.
// 막기 전에 기다리면 기다림이 끝난 직후 새 갱신이 시작될 틈이 남는다.
// authApi가 tokenRefresh를 import하면 순환 참조가 되므로 여기서 처리한다.
export async function logoutAfterPendingRefresh() {
  blockRefresh();
  await waitForPendingRefresh();
  await logout();
}

// 로컬 토큰을 다 지운 뒤에 갱신 차단을 푼다. 먼저 풀면 지우기 전에 새 갱신이 시작될 수 있고,
// 풀지 않으면 다시 로그인한 뒤에도 갱신이 막힌다.
export async function finishLogout() {
  try {
    await clearLocalSession();
  } finally {
    unblockRefresh();
  }
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: logoutAfterPendingRefresh,
    retry: false,
    onSettled: finishLogout,
  });
}
