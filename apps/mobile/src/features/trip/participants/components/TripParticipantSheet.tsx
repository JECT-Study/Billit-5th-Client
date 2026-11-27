import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  Share,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ParticipantEditor } from '@/features/trip/participants/components/ParticipantEditor';
import { ParticipantList } from '@/features/trip/participants/components/ParticipantList';
import { TripInvitationStatus } from '@/features/trip/participants/components/TripInvitationStatus';
import { ParticipantSheetActions } from '@/features/trip/participants/components/ParticipantSheetActions';
import {
  confirmTrip,
  getTripInvitation,
} from '@/features/trip/services/tripApi';
import type { Participant } from '@/features/trip/tripDetailSchema';
import { formatInvitationShareMessage } from '@/features/trip/invitation/tripInvitationShare';
import { tripKeys } from '@/features/trip/tripKeys';
import { formatTripDateRange } from '@/features/trip/list/tripListDisplay';
import {
  canManageTripParticipants,
  canOpenTrip,
} from '@/features/trip/participants/tripParticipantPermissions';
import { useParticipantSheetGesture } from '@/features/trip/participants/hooks/useParticipantSheetGesture';
import { useParticipantDetail } from '@/features/trip/participants/hooks/useParticipantDetail';
import { useParticipantSettingsNavigation } from '@/features/trip/participants/hooks/useParticipantSettingsNavigation';
import { useParticipantEditor } from '@/features/trip/participants/hooks/useParticipantEditor';
import { participantErrorMessage } from '@/features/trip/participants/tripParticipantError';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { Text } from '@/shared/ui/Text';
import { Toast } from '@/shared/ui/Toast';

type Props = { tripId: string; onClose: () => void };

export function TripParticipantSheet({ tripId, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);
  const scrollOffset = useRef(0);
  const [isSharing, setSharing] = useState(false);
  const [isClosingForSettings, setClosingForSettings] = useState(false);
  const [menuTripState, setMenuTripState] = useState<string | null>(null);
  const shareInProgress = useRef(false);
  const prepareRestoreRef = useRef<() => void>(() => {});
  const { isOpeningSettings, openSettings, handleSettingsSheetDismissed } =
    useParticipantSettingsNavigation(tripId, onClose, prepareRestoreRef);
  const { detail, trip, accessNotice, refresh } = useParticipantDetail(
    tripId,
    onClose,
    !isOpeningSettings,
  );
  const confirm = useMutation({
    mutationFn: () => confirmTrip(tripId),
    retry: false,
    onSuccess: refresh,
  });
  const canManage = canManageTripParticipants(trip);
  const isReadyToOpen = canOpenTrip(trip);
  const menuStateKey = trip
    ? `${trip.tripId}:${trip.memberCapacity}:${trip.registeredMemberCount}:${trip.status}:${trip.myRole}`
    : '';
  const isMenuOpen = isReadyToOpen && menuTripState === menuStateKey;
  const emptyCount = trip
    ? Math.max(0, trip.memberCapacity - trip.registeredMemberCount)
    : 0;
  const {
    editing,
    nickname,
    nicknameError,
    isNicknameDuplicated,
    isNicknameRequired,
    toast,
    isDeleteDialogVisible,
    isMutatingEditor,
    isRemoving,
    openEditor,
    handleNicknameChange,
    handleSave,
    handleDelete,
    handleCancelDelete,
    handleConfirmDelete,
    handleCloseEditor,
    handleDismissToast,
  } = useParticipantEditor({
    tripId,
    canManage,
    isSharing,
    isConfirming: confirm.isPending,
    shareInProgress,
    scrollOffsetRef: scrollOffset,
    refresh,
    setMessage,
  });
  const isMutating = isMutatingEditor || confirm.isPending;
  const isBusy = isMutating || isSharing || isClosingForSettings;
  const {
    sheetHeight,
    sheetTranslateY,
    sheetPanResponder,
    handleSheetShown,
    animateClose,
    animateToSettings,
    prepareSheetForReturn,
  } = useParticipantSheetGesture(
    isBusy,
    isOpeningSettings,
    onClose,
    scrollOffset,
  );
  useEffect(() => {
    prepareRestoreRef.current = prepareSheetForReturn;
  }, [prepareSheetForReturn]);
  async function handleShare() {
    if (isBusy || shareInProgress.current) return;
    shareInProgress.current = true;
    setSharing(true);
    try {
      await Share.share({
        message: formatInvitationShareMessage(await getTripInvitation(tripId)),
      });
    } catch (error) {
      setMessage(participantErrorMessage(error));
    } finally {
      shareInProgress.current = false;
      setSharing(false);
    }
  }

  async function handleConfirm() {
    if (isBusy || !isReadyToOpen) return;
    try {
      const result = await confirm.mutateAsync();
      if (result.status === 'CONFIRMED') {
        onClose();
        router.push({ pathname: '/trips/[tripId]', params: { tripId } });
      } else setMessage('참여자가 모두 모이면 여행방을 오픈할 수 있어요.');
    } catch (error) {
      setMessage(participantErrorMessage(error));
    }
  }

  function handleRequestClose() {
    if (accessNotice) {
      handleDismissAccessNotice();
      return;
    }
    if (isBusy) return;
    if (isMenuOpen) {
      setMenuTripState(null);
      return;
    }
    if (isDeleteDialogVisible) {
      handleCancelDelete();
      return;
    }
    if (editing) {
      handleCloseEditor();
    } else if (Platform.OS === 'android') {
      animateClose();
    } else {
      onClose();
    }
  }

  function handleDismissAccessNotice() {
    void queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
    onClose();
  }

  function handleAddGuest() {
    openEditor('new');
  }

  function handleEditParticipant(participant: Participant) {
    openEditor(participant);
  }

  function handleTripSettings() {
    if (!canManage || isBusy || shareInProgress.current || isOpeningSettings)
      return;
    setMenuTripState(null);
    if (Platform.OS === 'android') {
      setClosingForSettings(true);
      animateToSettings((finished) => {
        setClosingForSettings(false);
        if (finished) openSettings();
      });
    } else {
      openSettings();
    }
  }

  function handleToggleMenu() {
    setMenuTripState((current) =>
      current === menuStateKey ? null : menuStateKey,
    );
  }

  function handleCloseMenu() {
    setMenuTripState(null);
  }

  function handleShareFromMenu() {
    setMenuTripState(null);
    void handleShare();
  }

  return (
    <Modal
      transparent
      animationType={Platform.OS === 'android' ? 'none' : 'slide'}
      visible={!isOpeningSettings}
      onShow={handleSheetShown}
      onDismiss={handleSettingsSheetDismissed}
      onRequestClose={handleRequestClose}
    >
      {accessNotice ? (
        <View className="flex-1 bg-black/60">
          <Toast message={accessNotice} onDismiss={handleDismissAccessNotice} />
        </View>
      ) : editing ? (
        <ParticipantEditor
          editing={editing}
          nickname={nickname}
          nicknameError={nicknameError}
          isBusy={isBusy}
          isNicknameDuplicated={isNicknameDuplicated}
          isNicknameRequired={isNicknameRequired}
          message={message}
          toast={toast}
          onNicknameChange={handleNicknameChange}
          onBack={handleCloseEditor}
          onDelete={handleDelete}
          onSave={() => void handleSave()}
          onDismissToast={handleDismissToast}
        />
      ) : (
        <View className="flex-1 justify-end bg-black/60">
          <Pressable
            accessibilityLabel="참여 현황 닫기"
            onPress={handleRequestClose}
            className="flex-1"
          />
          <Animated.View
            className="bg-surface-default rounded-t-30 pt-30 max-h-[90%] px-24"
            style={{
              paddingBottom: Math.max(insets.bottom, 20),
              transform: [{ translateY: sheetTranslateY }],
            }}
            onLayout={(event) => {
              sheetHeight.current = event.nativeEvent.layout.height;
            }}
            {...sheetPanResponder.panHandlers}
          >
            {isMenuOpen && isReadyToOpen ? (
              <Pressable
                accessibilityLabel="메뉴 닫기"
                onPress={handleCloseMenu}
                className="absolute inset-0 z-10"
              />
            ) : null}
            {detail.isPending ? (
              <Text className="text-secondary py-32 text-center">
                불러오는 중이에요.
              </Text>
            ) : !trip ? (
              <View className="gap-16 py-32">
                <Text className="text-secondary text-center">
                  참여 현황을 불러오지 못했어요.
                </Text>
                <Button
                  label="다시 시도"
                  onPress={() => void detail.refetch()}
                />
              </View>
            ) : (
              <>
                <View
                  {...sheetPanResponder.panHandlers}
                  onStartShouldSetResponder={() =>
                    !isBusy && !isOpeningSettings && scrollOffset.current <= 0
                  }
                  className="flex-row items-start justify-between gap-10"
                >
                  <View className="flex-1">
                    <Text
                      className="text-strong text-headline-1 font-semibold"
                      numberOfLines={1}
                    >
                      {trip.name}
                    </Text>
                    <Text className="text-secondary text-caption-1">
                      {formatTripDateRange(trip.startDate, trip.endDate)}
                    </Text>
                  </View>
                  <TripInvitationStatus
                    registeredMemberCount={trip.registeredMemberCount}
                    isFull={emptyCount === 0}
                  />
                </View>
                <ParticipantList
                  trip={trip}
                  emptyCount={emptyCount}
                  canManage={canManage}
                  onAddGuest={handleAddGuest}
                  onEditParticipant={handleEditParticipant}
                  onScrollOffsetChange={(offset) => {
                    scrollOffset.current = offset;
                  }}
                />
                {message ? (
                  <Text
                    accessibilityRole="alert"
                    className="text-caption-1 text-red-alert-dark mb-8 text-center"
                  >
                    {message}
                  </Text>
                ) : null}
                <ParticipantSheetActions
                  trip={trip}
                  canManage={canManage}
                  emptyCount={emptyCount}
                  isMenuOpen={isMenuOpen}
                  isBusy={isBusy}
                  isMutating={isMutating}
                  isReadyToOpen={isReadyToOpen}
                  onShare={() => void handleShare()}
                  onShareFromMenu={handleShareFromMenu}
                  onSettings={handleTripSettings}
                  onToggleMenu={handleToggleMenu}
                  onConfirm={() => void handleConfirm()}
                />
              </>
            )}
          </Animated.View>
        </View>
      )}
      <ConfirmDialog
        visible={isDeleteDialogVisible && !accessNotice}
        title={
          editing && editing !== 'new'
            ? `‘${editing.tripNickname}’ 참여자를 삭제할까요?`
            : '이 참여자를 삭제할까요?'
        }
        description={'모든 정보가 영구적으로 삭제되며\n복원할 수 없습니다.'}
        cancelLabel="취소"
        confirmLabel="삭제하기"
        onCancel={handleCancelDelete}
        onConfirm={() => void handleConfirmDelete()}
        isConfirming={isRemoving}
        inline={Platform.OS === 'android'}
      />
    </Modal>
  );
}
