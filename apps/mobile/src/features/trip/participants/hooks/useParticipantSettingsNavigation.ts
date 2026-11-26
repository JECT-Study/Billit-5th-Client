import { useQueryClient } from '@tanstack/react-query';
import {
  type NativeStackNavigationProp,
  router,
  useNavigation,
} from 'expo-router';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { InteractionManager, Platform } from 'react-native';

import { getTrip } from '@/features/trip/services/tripApi';
import { tripKeys } from '@/features/trip/tripKeys';
import { parseApiError } from '@/lib/apiError';

export function useParticipantSettingsNavigation(
  tripId: string,
  onClose: () => void,
  prepareRestoreRef: RefObject<() => void>,
) {
  const navigation = useNavigation();
  const rootNavigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>(
      '/',
    );
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
    let hasReturnFocus = false;
    let hasTransitionFinished = false;
    let hasRefreshFinished = false;
    let shouldRestore = false;
    let hasCompleted = false;

    function finishReturnIfReady() {
      if (
        !isMounted ||
        hasCompleted ||
        !hasReturnFocus ||
        !hasTransitionFinished ||
        !hasRefreshFinished
      )
        return;
      hasCompleted = true;
      awaitingSettingsReturn.current = false;
      hasLeftForSettings.current = false;
      if (!shouldRestore) {
        onCloseRef.current();
        return;
      }
      prepareRestoreRef.current();
      setOpeningSettings(false);
    }

    const unsubscribeBlur = navigation.addListener('blur', () => {
      if (!awaitingSettingsReturn.current) return;
      hasLeftForSettings.current = true;
      hasReturnFocus = false;
      hasTransitionFinished = false;
      hasRefreshFinished = false;
      hasCompleted = false;
    });
    const unsubscribeFocus = navigation.addListener('focus', () => {
      if (
        !awaitingSettingsReturn.current ||
        !hasLeftForSettings.current ||
        hasReturnFocus
      )
        return;
      hasReturnFocus = true;

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
        .then((canRestore) => {
          if (!isMounted) return;
          shouldRestore = canRestore;
          hasRefreshFinished = true;
          finishReturnIfReady();
        });
    });
    const unsubscribeTransitionEnd = rootNavigation.addListener(
      'transitionEnd',
      (event) => {
        if (
          !event.data.closing ||
          !awaitingSettingsReturn.current ||
          !hasLeftForSettings.current
        )
          return;
        hasTransitionFinished = true;
        finishReturnIfReady();
      },
    );
    return () => {
      isMounted = false;
      unsubscribeBlur();
      unsubscribeFocus();
      unsubscribeTransitionEnd();
    };
  }, [navigation, prepareRestoreRef, queryClient, rootNavigation, tripId]);

  function openSettings() {
    if (isOpeningSettings || settingsNavigationPending.current) return;
    settingsNavigationPending.current = true;
    setOpeningSettings(true);
  }

  return {
    isOpeningSettings,
    openSettings,
    handleSettingsSheetDismissed,
  };
}
