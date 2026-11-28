import { useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { randomUUID } from 'expo-crypto';
import { useCallback, useRef, useState } from 'react';
import { BackHandler } from 'react-native';

import type { ExpenseRequest } from '@/features/expense/services/expenseApi';
import type { ManualExchangeRateRequest } from '@/features/exchangeRate/services/exchangeRateApi';
import { createExpenseSubmission } from '@/features/expense/creation/services/expenseSubmission';
import { tripKeys } from '@/features/trip/tripKeys';
import { parseApiError } from '@/lib/apiError';

export function useCreateExpenseMutation(
  tripId: string,
  request: ExpenseRequest,
  manualRateRequest: ManualExchangeRateRequest | null,
) {
  const queryClient = useQueryClient();
  const [key] = useState(() => randomUUID());
  const inFlight = useRef(false);
  const [isBusy, setIsBusy] = useState(false);
  const [isUncertain, setIsUncertain] = useState(false);
  const [error, setError] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [rateError, setRateError] = useState('');
  const [submission] = useState(() =>
    createExpenseSubmission(tripId, request, manualRateRequest, key, () => {
      setIsUncertain(false);
      setIsSaved(true);
      void queryClient.invalidateQueries({ queryKey: tripKeys.all });
    }),
  );

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener(
        'hardwareBackPress',
        () => isBusy || isUncertain,
      );
      return () => sub.remove();
    }, [isBusy, isUncertain]),
  );

  async function save() {
    if (inFlight.current) return;
    inFlight.current = true;
    setIsBusy(true);
    setError('');
    setRateError('');
    try {
      const result = await submission.submit();
      if (result.rateError)
        setRateError(
          '지출은 저장됐지만 내 환율 등록을 완료하지 못했어요. 다시 시도할 수 있어요.',
        );
    } catch (cause) {
      const apiError = parseApiError(cause);
      // 결과가 불확실할 때는 본문과 키를 유지해 재시도한다.
      const isSaveUncertain =
        isUncertain || !apiError?.status || apiError.status >= 500;
      setIsUncertain(isSaveUncertain);
      setError(
        isSaveUncertain
          ? '저장 결과를 확인하지 못했어요. 같은 요청으로 다시 확인해주세요.'
          : (apiError?.message ??
              '지출을 저장하지 못했어요. 입력 내용을 확인해주세요.'),
      );
    } finally {
      inFlight.current = false;
      setIsBusy(false);
    }
  }

  return { isBusy, isUncertain, isSaved, error, rateError, save };
}
