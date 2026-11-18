import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';

import { parseApiError } from '@/lib/apiError';

import { registrationKeys } from '@/features/auth/queries/registrationKeys';
import { getRegistration } from '@/features/auth/services/authApi';
import { getRegistrationToken } from '@/features/auth/services/authStorage';
import { clearRegistrationSession } from '@/features/auth/services/clearRegistrationSession';

export function useRegistrationQuery() {
  const [hasRegistrationToken, setHasRegistrationToken] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    getRegistrationToken()
      .then((token) => {
        if (isCurrent) {
          setHasRegistrationToken(token !== null);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setHasRegistrationToken(false);
        }
      });
    return () => {
      isCurrent = false;
    };
  }, []);

  const query = useQuery({
    queryKey: registrationKeys.detail,
    enabled: hasRegistrationToken,
    queryFn: getRegistration,
  });

  useEffect(() => {
    if (parseApiError(query.error)?.status !== 401) {
      return;
    }
    clearRegistrationSession();
    router.replace('/login');
  }, [query.error]);

  return query;
}
