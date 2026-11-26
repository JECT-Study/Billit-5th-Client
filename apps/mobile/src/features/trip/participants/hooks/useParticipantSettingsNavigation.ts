import { useQueryClient } from '@tanstack/react-query';
import { router, useNavigation } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { InteractionManager, Platform } from 'react-native';

import { getTrip } from '@/features/trip/services/tripApi';
import { tripKeys } from '@/features/trip/tripKeys';
import { parseApiError } from '@/lib/apiError';

export function useParticipantSettingsNavigation(
  tripId: string,
  onClose: () => void,
) {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [isOpeningSettings, setOpeningSettings] = useState(false);
  const settingsNavigationPending = useRef(false);
  const awaitingSettingsReturn = useRef(false);
  const hasLeftForSettings = useRef(false);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const handleSettingsSheetDismissed = useCallback(() => {
    if (!settingsNavigationPending.current) return;
    settingsNavigationPending.current = false;
    awaitingSettingsReturn.current = true;
    router.push({ pathname: '/trips/[tripId]/settings', params: { tripId } });
  }, [tripId]);

  useEffect(() => {
    // Android Modal에는 onDismiss 이벤트가 없다.
    if (!isOpeningSettings || Platform.OS === 'ios') return;
    const task = InteractionManager.runAfterInteractions(
      handleSettingsSheetDismissed,
    );
    return () => task.cancel();
  }, [handleSettingsSheetDismissed, isOpeningSettings]);

  useEffect(() => {
    let isMounted = true;
    let restoreTask:
      ReturnType<typeof InteractionManager.runAfterInteractions> | undefined;
    const unsubscribeBlur = navigation.addListener('blur', () => {
      if (awaitingSettingsReturn.current) hasLeftForSettings.current = true;
    });
    const unsubscribeFocus = navigation.addListener('focus', () => {
      if (!awaitingSettingsReturn.current || !hasLeftForSettings.current)
        return;
      awaitingSettingsReturn.current = false;
      hasLeftForSettings.current = false;

      void queryClient
        .fetchQuery({
          queryKey: tripKeys.detail(tripId),
          queryFn: () => getTrip(tripId),
          staleTime: 0,
          retry: false,
        })
        .then(
          () => true,
          (error: unknown) => parseApiError(error)?.status !== 404,
        )
        .then((shouldRestore) => {
          if (!isMounted) return;
          if (!shouldRestore) {
            onCloseRef.current();
            return;
          }
          restoreTask = InteractionManager.runAfterInteractions(() => {
            if (isMounted) setOpeningSettings(false);
          });
        });
    });
    return () => {
      isMounted = false;
      restoreTask?.cancel();
      unsubscribeBlur();
      unsubscribeFocus();
    };
  }, [navigation, queryClient, tripId]);

  function openSettings() {
    if (isOpeningSettings || settingsNavigationPending.current) return;
    settingsNavigationPending.current = true;
    setOpeningSettings(true);
  }

  return { isOpeningSettings, openSettings, handleSettingsSheetDismissed };
}
