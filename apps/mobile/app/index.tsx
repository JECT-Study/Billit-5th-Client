import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

import { hasStoredSession } from '@/features/auth/services/authStorage';

const isMockApiEnabled =
  __DEV__ && process.env.EXPO_PUBLIC_USE_MOCK_API === 'true';

// TODO: GET /api/v1/me가 구현되면 여기서 호출해 토큰이 유효한지 확인한다
export default function IndexRoute() {
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    if (isMockApiEnabled) {
      setHasSession(true);
      return;
    }

    hasStoredSession()
      .then(setHasSession)
      .catch(() => setHasSession(false));
  }, []);

  if (hasSession === null) {
    return null;
  }

  return <Redirect href={hasSession ? '/trips' : '/login'} />;
}
