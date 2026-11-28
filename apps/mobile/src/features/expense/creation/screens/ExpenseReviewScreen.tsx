import { Pressable, ScrollView, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  calculateEqualShares,
  decimalString,
  parseDecimal,
} from '@/features/expense/creation/expenseCalculation';
import type { ExpenseRequest } from '@/features/expense/services/expenseApi';
import type { ManualExchangeRateRequest } from '@/features/exchangeRate/services/exchangeRateApi';
import { useCreateExpenseMutation } from '@/features/expense/creation/hooks/useCreateExpenseMutation';
import {
  formatExpenseAmount,
  formatKrwAmount,
} from '@/features/expense/creation/expenseDisplay';
import type { Participant } from '@/features/trip/tripDetailSchema';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { GradientText } from '@/shared/ui/GradientText';
import { CaretLeftMdIcon, CloseMdIcon, UserFillIcon } from '@/shared/ui/icons';
import { Text } from '@/shared/ui/Text';
import { COLORS } from '@/theme/theme.generated';

type Props = {
  tripId: string;
  request: ExpenseRequest;
  manualRateRequest: ManualExchangeRateRequest | null;
  participants: Participant[];
  currentMemberId: string | null;
  onBack: () => void;
  onDone: () => void;
  onSaved: () => void;
};

export function ExpenseReviewScreen({
  tripId,
  request,
  manualRateRequest,
  participants,
  currentMemberId,
  onBack,
  onDone,
  onSaved,
}: Props) {
  const { isBusy, isUncertain, error, isSaved, rateError, save } =
    useCreateExpenseMutation(tripId, request, manualRateRequest);
  const [isCancelDialogVisible, setIsCancelDialogVisible] = useState(false);
  const didNavigate = useRef(false);
  useEffect(() => {
    if (!isSaved || isBusy || rateError || didNavigate.current) return;
    didNavigate.current = true;
    onSaved();
  }, [isSaved, isBusy, rateError, onSaved]);
  const shares = calculateEqualShares(
    parseDecimal(request.originalAmount)!,
    parseDecimal(request.discountAmount)!,
    parseDecimal(request.exchangeRate)!,
    request.currency,
    request.tripMemberIds,
  );
  const total = decimalString(
    parseDecimal(request.originalAmount)! -
      parseDecimal(request.discountAmount)!,
  );

  async function handleSave() {
    await save();
  }

  function handleDone() {
    onSaved();
  }
  function handleBack() {
    onBack();
  }
  function handleOpenCancelDialog() {
    setIsCancelDialogVisible(true);
  }
  function handleCancelDialog() {
    setIsCancelDialogVisible(false);
  }
  function handleDiscard() {
    setIsCancelDialogVisible(false);
    onDone();
  }

  if (isSaved)
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
        <View className="flex-1 items-center justify-center gap-24 px-24">
          <Text className="text-headline-1 text-strong font-semibold">
            새로운 지출이 기록되었어요!
          </Text>
          {rateError ? (
            <Text
              accessibilityRole="alert"
              className="text-label-1 text-red-alert-dark"
            >
              {rateError}
            </Text>
          ) : null}
        </View>
        <View className="gap-10 px-24 pb-24">
          {rateError ? (
            <Button
              label={isBusy ? '환율 등록 중...' : '환율 등록 다시 시도'}
              onPress={handleSave}
              isDisabled={isBusy}
            />
          ) : null}
          <Button
            label="여행방으로 돌아가기"
            onPress={handleDone}
            isDisabled={isBusy}
          />
        </View>
      </SafeAreaView>
    );
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <View className="h-[44px] flex-row items-center px-14">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          accessibilityState={{ disabled: isBusy || isUncertain }}
          disabled={isBusy || isUncertain}
          onPress={handleBack}
          className="h-[44px] w-[44px] items-center justify-center"
        >
          <CaretLeftMdIcon />
        </Pressable>
        <Text
          accessibilityRole="header"
          className="text-body-1 text-strong flex-1 text-center font-semibold"
        >
          지출 추가하기
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="지출 추가 닫기"
          accessibilityState={{ disabled: isBusy || isUncertain }}
          disabled={isBusy || isUncertain}
          onPress={handleOpenCancelDialog}
          className="h-[44px] w-[44px] items-center justify-center"
        >
          <CloseMdIcon />
        </Pressable>
      </View>
      <ScrollView
        contentContainerClassName="px-24 pt-32 pb-24"
        showsVerticalScrollIndicator={false}
      >
        <GradientText
          text="지출 추가 미리보기"
          size="heading-1"
          family="suit-semibold"
          className="text-heading-1 font-semibold"
          startColor={COLORS['gray-8']}
          endColor={COLORS['teal-gradient-end']}
          accessibilityRole="header"
        />
        <Text className="text-headline-1 text-strong mt-30 font-semibold">
          {request.name}, {formatExpenseAmount(total, request.currency)}
        </Text>
        <View className="mt-30 gap-4">
          {shares.map((share) => {
            const participant = participants.find(
              (item) => item.tripMemberId === share.id,
            );
            const isMe =
              participant?.memberId != null &&
              participant.memberId === currentMemberId;
            return (
              <View
                key={share.id}
                className="border-gray-2 h-[59px] flex-row items-center justify-between border-b px-4"
              >
                <View className="flex-1 flex-row items-center gap-6">
                  <View className="bg-gray-3 h-32 w-32 items-center justify-center rounded-full">
                    <UserFillIcon size={16} color={COLORS.white} />
                  </View>
                  <Text
                    className="text-label-1 text-gray-7 flex-1 font-semibold"
                    numberOfLines={1}
                  >
                    {participant?.tripNickname ?? '참여자'}
                    {isMe ? ' (나)' : ''}
                  </Text>
                </View>
                <View className="ml-8 items-end">
                  <Text className="text-body-1 text-strong font-semibold">
                    {formatExpenseAmount(share.amount, request.currency)}
                  </Text>
                  <Text className="text-caption-1 text-strong font-semibold">
                    {formatKrwAmount(share.amountKrw)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
        {error ? (
          <Text
            accessibilityRole="alert"
            className="text-label-1 text-red-alert-dark"
          >
            {error}
          </Text>
        ) : null}
      </ScrollView>
      <View className="flex-row gap-12 px-24 pb-20 pt-8">
        <View style={{ flex: 1, minWidth: 0 }}>
          <Button
            label="이전"
            variant="light"
            onPress={handleBack}
            isDisabled={isBusy || isUncertain}
          />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Button
            label={
              isBusy ? '저장 중...' : isUncertain ? '다시 확인하기' : '저장'
            }
            onPress={handleSave}
            isDisabled={isBusy}
          />
        </View>
      </View>
      <ConfirmDialog
        visible={isCancelDialogVisible}
        title="지출 추가를 취소할까요?"
        description={'모든 정보가 영구적으로 삭제되며\n복원할 수 없습니다.'}
        cancelLabel="취소"
        confirmLabel="삭제하기"
        onCancel={handleCancelDialog}
        onConfirm={handleDiscard}
      />
    </SafeAreaView>
  );
}
