import { useMutation } from '@tanstack/react-query';

import { parseApiError } from '@/lib/apiError';

import { completeRegistration } from '@/features/auth/services/authApi';
import { saveAuthTokens } from '@/features/auth/services/authStorage';
import { clearRegistrationSession } from '@/features/auth/services/clearRegistrationSession';

export function useCompleteRegistrationMutation() {
  return useMutation({
    mutationFn: completeRegistration,
    retry: false,
    onSuccess: async (tokens) => {
      await saveAuthTokens(tokens);
      clearRegistrationSession();
    },
    onError: (error) => {
      if (parseApiError(error)?.status === 401) {
        clearRegistrationSession();
      }
    },
  });
}
