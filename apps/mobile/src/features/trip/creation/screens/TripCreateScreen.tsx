import * as Crypto from 'expo-crypto';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
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
import { useCreateTripMutation } from '@/features/trip/creation/hooks/useCreateTripMutation';
import {
  INITIAL_TRIP_DRAFT,
  TRIP_COUNTRIES,
  type TripCountryCode,
  type TripCreationDraft,
  type TripCreationStep,
  type TripCurrency,
} from '@/features/trip/shared/tripCreationForm';
import {
  getTripCreationAttempt,
  toCreateTripRequest,
  type TripCreationAttempt,
} from '@/features/trip/creation/services/tripCreationRequest';
import {
  getTripCreationTextFieldError,
  isTripStepInputEmpty,
  tripCreationSchema,
  validateTripCreationStep,
} from '@/features/trip/shared/tripCreationSchema';
import { parseApiError } from '@/lib/apiError';
import { Button } from '@/shared/ui/Button';
import { NavigationHeader } from '@/shared/ui/NavigationHeader';
import { StepIndicator } from '@/shared/ui/StepIndicator';
import { Text } from '@/shared/ui/Text';
import { TextField } from '@/shared/ui/TextField';
import { Toast } from '@/shared/ui/Toast';

// 여행명 → 국가 → 통화 → 기간 → 동행자는 단계가 늘수록 새 입력 항목이 위에 쌓이고,
// 마지막 닉네임 단계는 닉네임만 보여준다
const LAST_STEP = 5;
const NICKNAME_STEP = 5;
const REQUIRED_INPUT_MESSAGE = '필수 입력란을 채워주세요!';

export function TripCreateScreen() {
  const [draft, setDraft] = useState<TripCreationDraft>(INITIAL_TRIP_DRAFT);
  const [step, setStep] = useState<TripCreationStep>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRequiredErrorShown, setIsRequiredErrorShown] = useState(false);
  const createTripMutation = useCreateTripMutation();
  const attemptRef = useRef<TripCreationAttempt | null>(null);
  const isSubmittingRef = useRef(false);

  // 입력 중에는 빈 값의 문구를 숨기고, 형식 오류는 스키마 메시지를 그대로 보여준다
  const nameErrorMessage = getTripCreationTextFieldError('name', draft.name);
  const nicknameErrorMessage = getTripCreationTextFieldError(
    'nickname',
    draft.nickname,
  );
  const isLastStep = step === LAST_STEP;
  const isStepValid = isLastStep
    ? tripCreationSchema.safeParse(draft).success
    : validateTripCreationStep(draft, step) === null;

  function updateDraft(patch: Partial<TripCreationDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  const handlePressBack = useCallback(() => {
    if (isSubmittingRef.current || createTripMutation.isPending) return;
    if (step === 0) {
      router.back();
      return;
    }
    setIsRequiredErrorShown(false);
    setStep((current) => (current - 1) as TripCreationStep);
  }, [step, createTripMutation.isPending]);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return;
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          handlePressBack();
          return true;
        },
      );
      return () => subscription.remove();
    }, [handlePressBack]),
  );

  async function handlePressNext() {
    if (isSubmittingRef.current) return;
    if (!isStepValid) {
      // 비어 있으면 공통 토스트로 알리고, 형식이 틀린 경우는 입력창 아래 문구가 이미 보인다
      if (isTripStepInputEmpty(draft, step)) {
        setIsRequiredErrorShown(true);
        setToastMessage(REQUIRED_INPUT_MESSAGE);
      }
      return;
    }
    if (isLastStep) {
      const result = tripCreationSchema.safeParse(draft);
      if (!result.success) return;

      const request = toCreateTripRequest(result.data);
      const attempt = getTripCreationAttempt(
        request,
        attemptRef.current,
        Crypto.randomUUID,
      );
      attemptRef.current = attempt;
      isSubmittingRef.current = true;

      try {
        const trip = await createTripMutation.mutateAsync({
          request,
          idempotencyKey: attempt.idempotencyKey,
        });
        router.replace({
          pathname: '/trips/created',
          params: { tripId: trip.tripId, name: trip.name },
        });
      } catch (error) {
        const apiError = parseApiError(error);
        if (apiError?.code === 'TRIP_IDEMPOTENCY_KEY_REUSED') {
          attemptRef.current = null;
        }
        setToastMessage(
          apiError?.message ?? '여행방을 만들지 못했어요. 다시 시도해주세요.',
        );
        isSubmittingRef.current = false;
      }
      return;
    }
    setIsRequiredErrorShown(false);
    setStep((current) => (current + 1) as TripCreationStep);
  }

  function handleDismissToast() {
    setToastMessage(null);
  }

  function handleChangeName(name: string) {
    setIsRequiredErrorShown(false);
    updateDraft({ name });
  }

  function handleChangeNickname(nickname: string) {
    setIsRequiredErrorShown(false);
    updateDraft({ nickname });
  }

  function handleSelectCountry(code: TripCountryCode) {
    const country = TRIP_COUNTRIES.find((item) => item.code === code);
    updateDraft({
      countryCode: code,
      baseCurrency: country?.currency ?? draft.baseCurrency,
    });
  }

  function handleChangeCustomCountryName(customCountryName: string) {
    updateDraft({ customCountryName });
  }

  function handleChangeCurrency(baseCurrency: TripCurrency) {
    updateDraft({ baseCurrency });
  }

  function handleSelectDate(target: 'startDate' | 'endDate', date: string) {
    if (target === 'startDate') {
      // 시작일이 종료일보다 늦어지면 종료일을 다시 고르게 비운다.
      updateDraft({
        startDate: date,
        endDate: draft.endDate && draft.endDate < date ? '' : draft.endDate,
      });
    } else {
      updateDraft({ endDate: date });
    }
  }

  function handleSelectMemberCount(value: number) {
    updateDraft({ memberCapacity: value });
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
        <NavigationHeader
          title="여행방 만들기"
          onPressBack={handlePressBack}
          isBackDisabled={createTripMutation.isPending}
        />
        <View className="px-24">
          <StepIndicator
            stepCount={LAST_STEP + 1}
            currentStepIndex={step}
            className="mt-12"
          />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-24 px-24 pb-24 pt-24"
          keyboardShouldPersistTaps="handled"
        >
          {step === NICKNAME_STEP ? (
            <TextField
              label="닉네임"
              value={draft.nickname}
              placeholder="닉네임을 입력해주세요"
              maxLength={10}
              onChangeText={handleChangeNickname}
              hint="한글, 영문, 숫자 1~10자"
              errorMessage={nicknameErrorMessage}
              hasError={isRequiredErrorShown}
              autoFocus
            />
          ) : null}

          {step === 0 ? (
            <Text className="text-headline-1 font-semibold text-black">
              {'먼저 여행에 필요한 정보를\n여쭤볼게요!'}
            </Text>
          ) : null}

          {step >= 4 && step < NICKNAME_STEP ? (
            <TripMemberCapacityField
              value={draft.memberCapacity}
              onChange={handleSelectMemberCount}
            />
          ) : null}

          {step >= 3 && step < NICKNAME_STEP ? (
            <TripDateRangeField
              startDate={draft.startDate}
              endDate={draft.endDate}
              onSelectDate={handleSelectDate}
            />
          ) : null}

          {step >= 2 && step < NICKNAME_STEP ? (
            <TripCurrencyField
              value={draft.baseCurrency}
              onChange={handleChangeCurrency}
            />
          ) : null}

          {step >= 1 && step < NICKNAME_STEP ? (
            <TripCountrySelect
              countryCode={draft.countryCode}
              customCountryName={draft.customCountryName}
              onSelectCountry={handleSelectCountry}
              onChangeCustomCountryName={handleChangeCustomCountryName}
            />
          ) : null}

          {step < NICKNAME_STEP ? (
            <TextField
              label="여행명"
              value={draft.name}
              placeholder="여행명을 입력해주세요"
              maxLength={15}
              onChangeText={handleChangeName}
              hint={step === 0 ? '한글, 영문, 숫자 1~15자' : undefined}
              errorMessage={nameErrorMessage}
              hasError={step === 0 && isRequiredErrorShown}
              autoFocus
            />
          ) : null}
        </ScrollView>

        <View className="px-24 pb-8 pt-8">
          {step === NICKNAME_STEP ? (
            <Text className="text-secondary text-caption-2 mb-12 text-center font-medium">
              앞으로 이 여행방에서 사용할 닉네임이에요.
            </Text>
          ) : null}
          {/* 비어 있어도 눌러서 필수 입력 안내를 띄우므로 disabled 대신 같은 모습의 secondary로 보여준다. */}
          <Button
            label={isLastStep ? '여행방 만들기' : '다음'}
            variant={isStepValid ? 'primary' : 'secondary'}
            onPress={handlePressNext}
            isDisabled={createTripMutation.isPending}
          />
        </View>
      </KeyboardAvoidingView>

      {toastMessage ? (
        <Toast message={toastMessage} onDismiss={handleDismissToast} />
      ) : null}
    </SafeAreaView>
  );
}
