import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { useExpenseParticipants } from '@/features/expense/creation/hooks/useExpenseParticipants';
import { ExpenseReviewScreen } from '@/features/expense/creation/screens/ExpenseReviewScreen';
import { ExpenseParticipantSheet } from '@/features/expense/creation/components/ExpenseParticipantSheet';
import {
  ExpenseInput,
  ExpenseSelectionRow,
} from '@/features/expense/creation/components/ExpenseFormFields';
import type { ExpenseRequest } from '@/features/expense/services/expenseApi';
import type { ManualExchangeRateRequest } from '@/features/exchangeRate/services/exchangeRateApi';
import { useReferenceExchangeRate } from '@/features/expense/creation/hooks/useReferenceExchangeRate';
import {
  CURRENCY_CODES,
  CURRENCY_OPTIONS,
  CURRENCY_SYMBOLS,
  type Currency,
} from '@/shared/currency';
import {
  EXPENSE_NAME_MAX_LENGTH,
  hasMissingExpenseFields,
  validateExpense,
} from '@/features/expense/creation/expenseValidation';
import { makeExpenseCreationRequest } from '@/features/expense/creation/services/expenseCreationRequest';
import {
  formatMoneyInput,
  unformatMoneyInput,
} from '@/features/expense/creation/moneyInput';
import { hasChangedReferenceExchangeRate } from '@/features/expense/creation/manualExchangeRate';
import { useTripQuery } from '@/features/trip/hooks/useTripQuery';
import { CurrencyFlag } from '@/shared/ui/CurrencyFlag';
import { Button } from '@/shared/ui/Button';
import { DropdownMenu } from '@/shared/ui/DropdownMenu';
import { DatePicker, toDateString } from '@/shared/ui/DatePicker';
import { GradientBackground } from '@/shared/ui/GradientBackground';
import type { PopoverAnchor } from '@/shared/ui/popoverPosition';
import {
  CalendarIcon,
  CameraFillIcon,
  CaretDownSmIcon,
} from '@/shared/ui/icons';
import { NavigationHeader } from '@/shared/ui/NavigationHeader';
import { Text } from '@/shared/ui/Text';
import { Toast } from '@/shared/ui/Toast';
import { COLORS } from '@/theme/theme.generated';

type ExpenseCreateScreenProps = { tripId: string | undefined };

export function ExpenseCreateScreen({ tripId }: ExpenseCreateScreenProps) {
  const insets = useSafeAreaInsets();
  const { data: trip } = useTripQuery(tripId);
  const {
    currentMemberId,
    participants,
    selectedParticipants,
    pendingParticipants,
    effectivePayerId,
    selectedPayer,
    pendingPayerId,
    isParticipantSheetOpen,
    isPayerSheetOpen,
    handleOpenParticipants,
    handleConfirmParticipants,
    handleToggleParticipant,
    handleCloseParticipants,
    handleOpenPayer,
    handleConfirmPayer,
    handleSelectPayer,
    handleClosePayer,
    participantName,
  } = useExpenseParticipants(trip);
  const dateFieldRef = useRef<View>(null);
  const [dateAnchor, setDateAnchor] = useState<PopoverAnchor | null>(null);
  const [paidDate, setPaidDate] = useState(() => toDateString(new Date()));
  const [name, handleChangeName] = useState('');
  const [toastSequence, setToastSequence] = useState(0);
  const [amount, handleChangeAmount] = useState('');
  const [discount, handleChangeDiscount] = useState('');
  const [payment, setPayment] = useState('현금');
  const [manualRate, setManualRate] = useState<{
    context: string;
    value: string;
  } | null>(null);
  const [reviewRequest, setReviewRequest] = useState<ExpenseRequest | null>(
    null,
  );
  const [reviewManualRate, setReviewManualRate] =
    useState<ManualExchangeRateRequest | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(
    null,
  );
  const [isCurrencyMenuOpen, setIsCurrencyMenuOpen] = useState(false);
  const currency = selectedCurrency ?? trip?.baseCurrency;
  const shouldFetchReference = Boolean(currency && currency !== 'KRW');
  const rateContext = `${currency ?? ''}:${paidDate}`;
  const referenceRate = useReferenceExchangeRate(
    currency,
    paidDate,
    shouldFetchReference,
  );
  const effectiveManualRate =
    manualRate?.context === rateContext ? manualRate.value : null;
  const exchangeRate =
    currency === 'KRW'
      ? '1.00'
      : (effectiveManualRate ??
        (shouldFetchReference ? referenceRate.data?.rate : '') ??
        '');
  const isManualRateChanged = hasChangedReferenceExchangeRate(
    effectiveManualRate,
    referenceRate.data?.rate,
  );
  const isRateAuto =
    currency !== 'KRW' &&
    !isManualRateChanged &&
    shouldFetchReference &&
    Boolean(referenceRate.data);
  function handleChangeExchangeRate(value: string) {
    setManualRate({ context: rateContext, value: unformatMoneyInput(value) });
  }

  function handleSelectCurrency(value: string) {
    if (CURRENCY_CODES.some((code) => code === value)) {
      setSelectedCurrency(value as Currency);
      setIsCurrencyMenuOpen(false);
    }
  }

  function handleOpenDatePicker() {
    dateFieldRef.current?.measureInWindow((_x, y, _width, height) => {
      setDateAnchor({ top: y, bottom: y + height });
    });
  }

  function handleSelectDate(date: string) {
    if (date > toDateString(new Date())) return;
    setPaidDate(date);
    setDateAnchor(null);
  }

  function handleCloseDatePicker() {
    setDateAnchor(null);
  }

  function handlePressBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/trips');
  }

  const { original, discounted, rate, isValid } = validateExpense({
    tripId,
    tripStatus: trip?.status,
    currency,
    name,
    amount,
    discount,
    exchangeRate,
    participants,
    participantIds: selectedParticipants,
    payerId: effectivePayerId,
    isRateFetching: referenceRate.isFetching,
  });

  function handleReview() {
    if (
      !isValid &&
      hasMissingExpenseFields({
        name,
        amount,
        currency,
        exchangeRate,
        payerId: effectivePayerId,
        participantIds: selectedParticipants,
      })
    ) {
      setToastSequence((current) => current + 1);
    }
    if (
      !isValid ||
      !currency ||
      !effectivePayerId ||
      original === null ||
      discounted === null ||
      rate === null
    )
      return;
    const { request, manualRateRequest } = makeExpenseCreationRequest({
      name,
      currency,
      paidDate,
      payment,
      payerId: effectivePayerId,
      original,
      discounted,
      rate,
      isRateAuto,
      isManualRateChanged,
      participantIds: selectedParticipants,
    });
    setReviewManualRate(manualRateRequest);
    setReviewRequest(request);
  }
  function handleDismissToast() {
    setToastSequence(0);
  }
  function handleReviewBack() {
    setReviewRequest(null);
  }
  function handleDone() {
    if (router.canGoBack()) router.back();
    else if (tripId)
      router.replace({ pathname: '/trips/[tripId]', params: { tripId } });
    else router.replace('/trips');
  }
  function handleSaveComplete() {
    if (!tripId) return;
    const destination = {
      pathname: '/trips/[tripId]' as const,
      params: { tripId, expenseAdded: '1' },
    };
    if (router.canDismiss()) router.dismissTo(destination);
    else router.replace(destination);
  }
  if (reviewRequest && tripId)
    return (
      <ExpenseReviewScreen
        tripId={tripId}
        request={reviewRequest}
        manualRateRequest={reviewManualRate}
        participants={participants}
        currentMemberId={currentMemberId}
        onBack={handleReviewBack}
        onDone={handleDone}
        onSaved={handleSaveComplete}
      />
    );

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      className="bg-surface-default flex-1"
    >
      <View
        pointerEvents="none"
        className="absolute inset-x-0 top-0"
        style={{ height: 372 }}
      >
        <GradientBackground
          startColor={COLORS['sky-20']}
          endColor={COLORS['sky-20']}
          endOpacity={0}
        />
      </View>
      {/* TODO: 카메라 및 OCR */}
      <NavigationHeader
        title="지출 추가하기"
        onPressBack={handlePressBack}
        right={<CameraFillIcon />}
      />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 24,
          flexGrow: 1,
        }}
      >
        <View className="mb-24 flex-row">
          <View className="border-gray-6 h-40 flex-1 items-center justify-center border-b">
            <Text className="text-label-1 text-strong font-medium">
              총지출 기록
            </Text>
          </View>
          <View className="h-40 flex-1 items-center justify-center">
            <Text className="text-label-1 text-secondary">품목별 기록</Text>
          </View>
        </View>
        <View className="gap-24">
          <ExpenseInput
            label="지출명"
            placeholder="예: 택시"
            value={name}
            onChangeText={handleChangeName}
            maxLength={EXPENSE_NAME_MAX_LENGTH}
          />
          <View style={{ zIndex: 1 }}>
            <ExpenseInput
              label="총 금액"
              placeholder="지출 금액을 입력해주세요"
              value={amount}
              onChangeText={handleChangeAmount}
              numeric
              prefix={currency ? CURRENCY_SYMBOLS[currency] : undefined}
              suffix={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="결제 통화 선택"
                  accessibilityState={{ expanded: isCurrencyMenuOpen }}
                  onPress={() => setIsCurrencyMenuOpen((open) => !open)}
                  className="rounded-24 h-28 flex-row items-center gap-4 bg-sky-50 px-12"
                >
                  <Text className="text-label-1 font-medium text-white">
                    {CURRENCY_OPTIONS.find(
                      (option) => option.value === currency,
                    )?.label ?? '통화 선택'}
                  </Text>
                  <CaretDownSmIcon color={COLORS.white} />
                </Pressable>
              }
            />
            {isCurrencyMenuOpen ? (
              <View
                className="top-30 absolute right-0 w-[148px]"
                style={{ zIndex: 2 }}
              >
                <DropdownMenu
                  options={CURRENCY_OPTIONS}
                  selectedValue={currency}
                  onSelect={handleSelectCurrency}
                />
              </View>
            ) : null}
          </View>
          <View className="mt-8 gap-14">
            <Text className="text-label-1 text-secondary font-medium">
              지출수단
            </Text>
            <View className="flex-row gap-8">
              {['현금', '카드', '트래블카드'].map((option) => (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  accessibilityState={{ selected: payment === option }}
                  onPress={() => setPayment(option)}
                  className={`rounded-8 h-[46px] flex-1 items-center justify-center ${payment === option ? 'bg-sky-40' : 'border-gray-2 border bg-white'}`}
                >
                  <Text
                    className={`text-body-2 font-medium ${payment === option ? 'text-white' : 'text-secondary'}`}
                  >
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View className="gap-10">
            <ExpenseSelectionRow
              label="정산 대상자"
              value="선택하기"
              onPress={handleOpenParticipants}
            />
            {selectedParticipants.length > 0 ? (
              <View className="flex-row flex-wrap gap-x-6 gap-y-4">
                {participants
                  .filter((participant) =>
                    selectedParticipants.includes(participant.tripMemberId),
                  )
                  .map((participant) => (
                    <View
                      key={participant.tripMemberId}
                      className="rounded-6 bg-sky-10 h-32 items-center justify-center px-8"
                    >
                      <Text className="text-caption-1 font-semibold text-sky-50">
                        {participantName(participant)}
                      </Text>
                    </View>
                  ))}
              </View>
            ) : null}
          </View>
          <ExpenseSelectionRow
            label="결제자"
            value={selectedPayer ? participantName(selectedPayer) : '선택하기'}
            onPress={handleOpenPayer}
          />
          <View className="gap-10">
            <Text className="text-label-1 text-secondary font-medium">
              결제 일시
            </Text>
            <View ref={dateFieldRef} collapsable={false}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="결제 일시 선택"
                onPress={handleOpenDatePicker}
                className="rounded-8 border-gray-2 h-[44px] flex-row items-center gap-8 border px-16"
              >
                <CalendarIcon color={COLORS['gray-6']} />
                <Text className="text-label-1 text-strong flex-1 font-medium">
                  {paidDate.replaceAll('-', '.')}
                </Text>
                <CaretDownSmIcon color={COLORS['gray-6']} />
              </Pressable>
            </View>
          </View>
          <View className="gap-10">
            <View className="flex-row items-center justify-between gap-8">
              <Text className="text-label-1 text-secondary font-medium">
                환율
              </Text>
              {shouldFetchReference && referenceRate.isError ? (
                <Text className="text-caption-1 text-red-alert-dark shrink text-right font-semibold">
                  환율 정보를 불러오지 못했어요. 직접 입력해주세요.
                </Text>
              ) : currency === 'KRW' ? (
                <Text className="text-caption-2 text-muted">원화 기준</Text>
              ) : isRateAuto && referenceRate.data ? (
                <Text className="text-caption-2 text-muted shrink text-right">
                  {referenceRate.data.provider === 'ECB'
                    ? 'ECB(유럽중앙은행)'
                    : referenceRate.data.provider}
                  {' 기준 · '}
                  {referenceRate.data.baseDate.replaceAll('-', '.')}
                </Text>
              ) : null}
            </View>
            <View className="h-48 flex-row items-center gap-8">
              <View className="flex-1 flex-row items-center gap-4">
                {currency ? <CurrencyFlag currency={currency} /> : null}
                <View className="border-sky-30 h-48 flex-1 flex-row items-center border-b px-4">
                  <Text className="text-body-2 text-strong flex-1 font-medium">
                    1
                  </Text>
                  <Text className="text-caption-1 text-strong">
                    {currency ?? '통화'}
                  </Text>
                </View>
              </View>
              <Text className="text-body-2 text-strong">=</Text>
              <View className="flex-1 flex-row items-center gap-4">
                <CurrencyFlag currency="KRW" />
                <View className="border-sky-30 h-48 flex-1 flex-row items-center border-b px-4">
                  <TextInput
                    accessibilityLabel="원화 환율"
                    value={formatMoneyInput(exchangeRate)}
                    onChangeText={handleChangeExchangeRate}
                    editable={currency !== 'KRW'}
                    keyboardType="decimal-pad"
                    placeholder="환율"
                    placeholderTextColor={COLORS['gray-5']}
                    className="text-strong flex-1 p-0"
                  />
                  <Text className="text-caption-1 text-strong">KRW</Text>
                </View>
              </View>
            </View>
            {referenceRate.isFetching && shouldFetchReference ? (
              <Text className="text-caption-1 text-secondary">
                결제일 기준 환율을 불러오고 있어요.
              </Text>
            ) : null}
            {isRateAuto && referenceRate.data?.baseDate !== paidDate ? (
              <Text className="text-caption-1 text-secondary">
                결제일 이전의 고시 환율을 적용했어요.
              </Text>
            ) : null}
            {currency && currency !== 'KRW' && tripId ? (
              // TODO: 내 환율 목록
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: true }}
                disabled
                className="rounded-12 border-sky-30 h-[34px] items-center justify-center border"
              >
                <Text className="text-label-1 text-sky-80 font-medium">
                  내 환율 가져오기
                </Text>
              </Pressable>
            ) : null}
          </View>
          <ExpenseInput
            label="할인 금액 (선택)"
            placeholder="총 할인 금액을 입력해주세요"
            value={discount}
            onChangeText={handleChangeDiscount}
            numeric
            prefix={currency ? CURRENCY_SYMBOLS[currency] : undefined}
          />
        </View>
        <View className="min-h-[80px] flex-1 gap-4 pt-8">
          {amount && original === null ? (
            <Text className="text-caption-1 text-red-alert-dark">
              {currency === 'KRW' || currency === 'JPY'
                ? '금액은 1 단위로 입력해주세요.'
                : '금액은 소수점 둘째 자리까지 입력해주세요.'}
            </Text>
          ) : null}
          {discount &&
          (discounted === null ||
            (original !== null && discounted > original)) ? (
            <Text className="text-caption-1 text-red-alert-dark">
              할인 금액은 총 금액 이하로 입력해주세요.
            </Text>
          ) : null}
          {exchangeRate && (rate === null || rate <= 0n) ? (
            <Text className="text-caption-1 text-red-alert-dark">
              환율은 0보다 큰 금액으로 소수점 둘째 자리까지 입력해주세요.
            </Text>
          ) : null}
        </View>
        <Button
          label="다음"
          variant={isValid ? 'primary' : 'secondary'}
          onPress={handleReview}
        />
      </ScrollView>
      {dateAnchor ? (
        <DatePicker
          value={paidDate}
          maximumDate={toDateString(new Date())}
          anchor={dateAnchor}
          onSelect={handleSelectDate}
          onClose={handleCloseDatePicker}
        />
      ) : null}
      <ExpenseParticipantSheet
        visible={isParticipantSheetOpen}
        mode="participants"
        participants={participants}
        selectedIds={pendingParticipants}
        getName={participantName}
        onSelect={handleToggleParticipant}
        onClose={handleCloseParticipants}
        onConfirm={handleConfirmParticipants}
      />
      <ExpenseParticipantSheet
        visible={isPayerSheetOpen}
        mode="payer"
        participants={participants}
        selectedIds={pendingPayerId ? [pendingPayerId] : []}
        getName={participantName}
        onSelect={handleSelectPayer}
        onClose={handleClosePayer}
        onConfirm={handleConfirmPayer}
      />
      {toastSequence > 0 ? (
        <Toast
          key={toastSequence}
          message="필수 입력란을 채워주세요!"
          onDismiss={handleDismissToast}
        />
      ) : null}
    </SafeAreaView>
  );
}
