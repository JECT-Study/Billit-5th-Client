import { useMutation } from '@tanstack/react-query';

import { logout } from '@/features/auth/services/authApi';
import { clearLocalSession } from '@/features/auth/services/clearLocalSession';

export function useLogoutMutation() {
  return useMutation({
    mutationFn: logout,
    retry: false,
    onSettled: () => clearLocalSession(),
  });
}
