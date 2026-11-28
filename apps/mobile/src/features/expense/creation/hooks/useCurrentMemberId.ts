import { useEffect, useState } from 'react';

import { getAccessToken } from '@/features/auth/services/authStorage';
import { getMemberIdFromAccessToken } from '@/features/expense/creation/currentMember';
import type { TripDetail } from '@/features/trip/tripDetailSchema';

export function useCurrentMemberId(trip: TripDetail | undefined) {
  const [currentMemberId, setCurrentMemberId] = useState<string | null>(null);
  useEffect(() => {
    if (!trip) return;
    let isActive = true;
    void getAccessToken()
      .then((token) => {
        if (isActive) setCurrentMemberId(getMemberIdFromAccessToken(token));
      })
      .catch(() => {
        if (isActive) setCurrentMemberId(null);
      });
    return () => {
      isActive = false;
    };
  }, [trip]);
  return currentMemberId;
}
