import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { getTrip } from '@/features/trip/services/tripApi';
import { tripKeys } from '@/features/trip/tripKeys';
import {
  getParticipantAccessNotice,
  shouldCloseParticipantSheet,
} from '@/features/trip/participants/tripParticipantStatus';

const PARTICIPANTS_REFRESH_INTERVAL_MS = 5_000;

export function useParticipantDetail(
  tripId: string,
  onClose: () => void,
  isVisible: boolean,
) {
  const queryClient = useQueryClient();
  const [isAppActive, setAppActive] = useState(
    AppState.currentState === 'active',
  );
  const hasClosedForConfirmation = useRef(false);
  const previousTripState = useRef<{
    tripId: string;
    registeredMemberCount: number;
    status: string;
  } | null>(null);
  const detail = useQuery({
    queryKey: tripKeys.detail(tripId),
    queryFn: () => getTrip(tripId),
    refetchInterval: (query) =>
      isVisible && isAppActive && !getParticipantAccessNotice(query.state.error)
        ? PARTICIPANTS_REFRESH_INTERVAL_MS
        : false,
  });
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      const isActive = state === 'active';
      setAppActive(isActive);
      if (isActive && isVisible) {
        void queryClient.invalidateQueries({
          queryKey: tripKeys.detail(tripId),
        });
      }
    });
    return () => subscription.remove();
  }, [isVisible, queryClient, tripId]);
  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: tripKeys.detail(tripId) }),
      queryClient.invalidateQueries({ queryKey: tripKeys.lists() }),
    ]);
  };
  const trip = detail.data;
  const accessNotice = getParticipantAccessNotice(detail.error);
  useEffect(() => {
    if (
      hasClosedForConfirmation.current ||
      !shouldCloseParticipantSheet(trip, detail.error)
    )
      return;
    hasClosedForConfirmation.current = true;
    void queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
    onClose();
    // 관리자가 오픈한 여행방 상세로 같이 이동한다.
    router.push({ pathname: '/trips/[tripId]', params: { tripId } });
  }, [detail.error, onClose, queryClient, trip, tripId]);
  useEffect(() => {
    if (!trip) return;
    const previous = previousTripState.current;
    if (
      previous?.tripId === tripId &&
      (previous.registeredMemberCount !== trip.registeredMemberCount ||
        previous.status !== trip.status)
    ) {
      void queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
    }
    previousTripState.current = {
      tripId,
      registeredMemberCount: trip.registeredMemberCount,
      status: trip.status,
    };
  }, [queryClient, tripId, trip]);
  return { detail, trip, accessNotice, refresh };
}
