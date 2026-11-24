import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TripCountrySelect } from '@/features/trip/components/TripCountrySelect';
import { TripCurrencyField } from '@/features/trip/components/TripCurrencyField';
import { TripDateRangeField } from '@/features/trip/components/TripDateRangeField';
import { TripMemberCapacityField } from '@/features/trip/components/TripMemberCapacityField';
import { useTripQuery } from '@/features/trip/hooks/useTripQuery';
import { useUpdateTripMutation } from '@/features/trip/hooks/useUpdateTripMutation';
import {
  buildTripUpdateRequest,
  hasTripUpdateChanges,
  toTripUpdateDraft,
  type TripUpdateDraft,
} from '@/features/trip/services/tripUpdateRequest';
import type {
  TripCountryCode,
  TripCurrency,
} from '@/features/trip/tripCreationForm';
import { getTripCreationTextFieldError } from '@/features/trip/tripCreationSchema';
import type { TripDetail } from '@/features/trip/tripDetailSchema';
import {
  canChangeTripCapacity,
  canEditTrip,
} from '@/features/trip/tripPermission';
import {
  ADMIN_ONLY_NOTICE,
  DELETED_TRIP_NOTICE,
  getTripLoadErrorNotice,
  getTripUpdateErrorNotice,
  type TripSettingsExit,
  type TripSettingsNotice,
} from '@/features/trip/tripSettings';
import { isTripUpdateDraftValid } from '@/features/trip/tripUpdateSchema';
import { Button } from '@/shared/ui/Button';
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
      <View className="px-24">
        <NavigationHeader title={TITLE} onPressBack={handlePressBack} />
      </View>
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
  const [draft, setDraft] = useState<TripUpdateDraft>(() =>
    toTripUpdateDraft(trip),
  );
  const [notice, setNotice] = useState<TripSettingsNotice | null>(null);

  // 409 뒤에 상세를 다시 받아 확정 상태가 되면 인원 필드가 바로 잠긴다.
  const canChangeCapacity = canChangeTripCapacity(trip);
  const request = buildTripUpdateRequest(trip, draft);
  const isLeaving = notice?.exitTo != null;
  const isBusy = updateTripMutation.isPending || isLeaving;
  const canSave =
    hasTripUpdateChanges(request) &&
    isTripUpdateDraftValid(trip, draft) &&
    !isBusy;
  const nameErrorMessage = getTripCreationTextFieldError('name', draft.name);

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
    // 4단계에서 삭제 확인 팝업을 연결한다.
  }

  function handlePressHeaderBack() {
    if (isBusy) return;
    leaveTripSettings('back');
  }

  function handleDismissNotice() {
    const exitTo = notice?.exitTo ?? null;
    setNotice(null);
    leaveTripSettings(exitTo);
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      className="bg-surface-default flex-1"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="px-24">
          <NavigationHeader
            title={TITLE}
            onPressBack={handlePressHeaderBack}
            isBackDisabled={isBusy}
          />
        </View>

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
            isDisabled={isBusy}
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

      {notice ? (
        <Toast message={notice.message} onDismiss={handleDismissNotice} />
      ) : null}
    </SafeAreaView>
  );
}
