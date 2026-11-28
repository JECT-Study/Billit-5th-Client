import { router, Stack, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TripCountrySelect } from '@/features/trip/shared/components/TripCountrySelect';
import { TripCurrencyField } from '@/features/trip/shared/components/TripCurrencyField';
import { TripDateRangeField } from '@/features/trip/shared/components/TripDateRangeField';
import { TripMemberCapacityField } from '@/features/trip/shared/components/TripMemberCapacityField';
import { useDeleteTripMutation } from '@/features/trip/settings/hooks/useDeleteTripMutation';
import { useTripQuery } from '@/features/trip/hooks/useTripQuery';
import { useUpdateTripMutation } from '@/features/trip/settings/hooks/useUpdateTripMutation';
import {
  buildTripUpdateRequest,
  hasTripUpdateChanges,
  toTripUpdateDraft,
  type TripUpdateDraft,
} from '@/features/trip/settings/services/tripUpdateRequest';
import type {
  TripCountryCode,
  TripCurrency,
} from '@/features/trip/shared/tripCreationForm';
import { getTripCreationTextFieldError } from '@/features/trip/shared/tripCreationSchema';
import type { TripDetail } from '@/features/trip/tripDetailSchema';
import {
  canChangeTripCapacity,
  canDeleteTrip,
  canEditTrip,
} from '@/features/trip/tripPermission';
import {
  ADMIN_ONLY_NOTICE,
  DELETED_TRIP_NOTICE,
  getTripDeleteErrorNotice,
  getTripLoadErrorNotice,
  getTripUpdateErrorNotice,
  type TripSettingsExit,
  type TripSettingsNotice,
} from '@/features/trip/settings/tripSettings';
import { isTripUpdateDraftValid } from '@/features/trip/settings/tripUpdateSchema';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { NavigationHeader } from '@/shared/ui/NavigationHeader';
import { TextField } from '@/shared/ui/TextField';
import { Toast } from '@/shared/ui/Toast';
import { COLORS } from '@/theme/theme.generated';

const TITLE = '여행방 설정';
const TRIP_NAME_MAX_LENGTH = 15;

function leaveTripSettings(exitTo: TripSettingsExit) {
  if (exitTo === 'trips') {
    router.dismissTo('/trips');
    return;
  }
  if (exitTo !== 'back') return;
  if (router.canGoBack()) router.back();
  else router.replace('/trips');
}

function handlePressBack() {
  leaveTripSettings('back');
}

type TripSettingsScreenProps = {
  tripId: string | undefined;
};

// 조회한 여행의 권한과 상태로 화면을 정한다.
export function TripSettingsScreen({ tripId }: TripSettingsScreenProps) {
  const tripQuery = useTripQuery(tripId);
  const trip = tripQuery.data;

  if (trip && canEditTrip(trip)) return <TripSettingsForm trip={trip} />;

  let notice: TripSettingsNotice | null = null;
  if (!tripId) notice = DELETED_TRIP_NOTICE;
  else if (trip) notice = ADMIN_ONLY_NOTICE;
  else if (tripQuery.isError) notice = getTripLoadErrorNotice(tripQuery.error);

  function handleDismissNotice() {
    if (notice) leaveTripSettings(notice.exitTo);
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      className="bg-surface-default flex-1"
    >
      <NavigationHeader title={TITLE} onPressBack={handlePressBack} />
      {notice ? null : (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={COLORS['action-primary-background']} />
        </View>
      )}
      {notice ? (
        <Toast message={notice.message} onDismiss={handleDismissNotice} />
      ) : null}
    </SafeAreaView>
  );
}

type TripSettingsFormProps = {
  trip: TripDetail;
};

function TripSettingsForm({ trip }: TripSettingsFormProps) {
  const updateTripMutation = useUpdateTripMutation();
  const deleteTripMutation = useDeleteTripMutation();
  const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
  const [draft, setDraft] = useState<TripUpdateDraft>(() =>
    toTripUpdateDraft(trip),
  );
  const [notice, setNotice] = useState<TripSettingsNotice | null>(null);

  // 409 뒤에 상세를 다시 받아 확정 상태가 되면 인원 필드가 바로 잠긴다.
  const canChangeCapacity = canChangeTripCapacity(trip);
  const request = buildTripUpdateRequest(trip, draft);
  const isLeaving = notice?.exitTo != null;
  const isBusy =
    updateTripMutation.isPending ||
    deleteTripMutation.isPending ||
    deleteTripMutation.isSuccess ||
    isLeaving;
  const canSave =
    hasTripUpdateChanges(request) &&
    isTripUpdateDraftValid(trip, draft) &&
    !isBusy;
  const nameErrorMessage = getTripCreationTextFieldError('name', draft.name);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return;
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => isBusy,
      );
      return () => subscription.remove();
    }, [isBusy]),
  );

  function updateDraft(patch: Partial<TripUpdateDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function handleChangeName(name: string) {
    updateDraft({ name });
  }

  function handleSelectCountry(countryCode: TripCountryCode) {
    updateDraft({ countryCode });
  }

  function handleChangeCustomCountryName(customCountryName: string) {
    updateDraft({ customCountryName });
  }

  function handleChangeCurrency(baseCurrency: TripCurrency) {
    updateDraft({ baseCurrency });
  }

  function handleSelectDate(target: 'startDate' | 'endDate', date: string) {
    if (target === 'startDate') {
      setDraft((current) => ({
        ...current,
        startDate: date,
        endDate: current.endDate < date ? '' : current.endDate,
      }));
    } else {
      updateDraft({ endDate: date });
    }
  }

  function handleSelectMemberCapacity(memberCapacity: number) {
    updateDraft({ memberCapacity });
  }

  async function handlePressSave() {
    if (!canSave) return;

    try {
      await updateTripMutation.mutateAsync({ tripId: trip.tripId, request });
      leaveTripSettings('back');
    } catch (error) {
      setNotice(getTripUpdateErrorNotice(error));
    }
  }

  function handlePressDelete() {
    setIsDeleteDialogVisible(true);
  }

  function handleCancelDelete() {
    setIsDeleteDialogVisible(false);
  }

  async function handleConfirmDelete() {
    if (deleteTripMutation.isPending) return;

    try {
      await deleteTripMutation.mutateAsync(trip.tripId);
      setIsDeleteDialogVisible(false);
      leaveTripSettings('trips');
    } catch (error) {
      setIsDeleteDialogVisible(false);
      setNotice(getTripDeleteErrorNotice(error));
    }
  }

  function handlePressHeaderBack() {
    if (isBusy) return;
    leaveTripSettings('back');
  }

  function handleDismissNotice() {
    const exitTo = notice?.exitTo ?? null;
    // 떠날 때는 notice를 남겨 이동하는 동안 버튼이 다시 켜지지 않게 한다.
    if (exitTo) {
      leaveTripSettings(exitTo);
      return;
    }
    setNotice(null);
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      className="bg-surface-default flex-1"
    >
      <Stack.Screen options={{ gestureEnabled: !isBusy }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <NavigationHeader
          title={TITLE}
          onPressBack={handlePressHeaderBack}
          isBackDisabled={isBusy}
        />

        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-24 px-24 pb-24 pt-24"
          keyboardShouldPersistTaps="handled"
        >
          <TextField
            label="여행명"
            value={draft.name}
            placeholder="여행명을 입력해주세요"
            maxLength={TRIP_NAME_MAX_LENGTH}
            onChangeText={handleChangeName}
            errorMessage={nameErrorMessage}
            hasError={draft.name.trim() === ''}
          />
          <TripCountrySelect
            countryCode={draft.countryCode}
            customCountryName={draft.customCountryName}
            onSelectCountry={handleSelectCountry}
            onChangeCustomCountryName={handleChangeCustomCountryName}
            isCustomInputAutoFocused={trip.countryCode !== 'ETC'}
          />
          <TripCurrencyField
            value={draft.baseCurrency}
            onChange={handleChangeCurrency}
          />
          <TripDateRangeField
            startDate={draft.startDate}
            endDate={draft.endDate}
            onSelectDate={handleSelectDate}
          />
          <TripMemberCapacityField
            label="여행 총인원 (생성자 포함)"
            value={
              canChangeCapacity ? draft.memberCapacity : trip.memberCapacity
            }
            onChange={handleSelectMemberCapacity}
            minValue={trip.registeredMemberCount}
            isDisabled={!canChangeCapacity}
            menuPlacement="above"
          />
        </ScrollView>

        <View className="flex-row gap-12 px-24 pb-8 pt-8">
          <Button
            label="여행 삭제"
            variant="light"
            onPress={handlePressDelete}
            isDisabled={isBusy || !canDeleteTrip(trip)}
            className="bg-gray-1 flex-1"
          />
          <Button
            label="저장하기"
            onPress={handlePressSave}
            isDisabled={!canSave}
            className="flex-1"
          />
        </View>
      </KeyboardAvoidingView>

      <ConfirmDialog
        visible={isDeleteDialogVisible}
        title="여행방을 삭제할까요?"
        description={'모든 정보가 영구적으로 삭제되며\n복원할 수 없습니다.'}
        cancelLabel="취소"
        confirmLabel="삭제하기"
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isConfirming={deleteTripMutation.isPending}
      />

      {notice ? (
        <Toast message={notice.message} onDismiss={handleDismissNotice} />
      ) : null}
    </SafeAreaView>
  );
}
