import {
  createExpense,
  type ExpenseRequest,
} from '@/features/expense/services/expenseApi';
import {
  registerManualExchangeRate,
  type ManualExchangeRateRequest,
} from '@/features/exchangeRate/services/exchangeRateApi';
import { parseApiError } from '@/lib/apiError';

// 지출 저장 후 환율 등록에 실패하면 지출을 다시 만들지 않고 환율만 재시도한다
export function createExpenseSubmission(
  tripId: string,
  request: ExpenseRequest,
  manualRate: ManualExchangeRateRequest | null,
  key: string,
  onExpenseSaved: () => void,
) {
  let isExpenseSaved = false;
  let isRateRegistered = false;

  async function submit() {
    if (!isExpenseSaved) {
      await createExpense(tripId, request, key);
      isExpenseSaved = true;
      onExpenseSaved();
    }
    if (!manualRate || isRateRegistered) return { rateError: false };
    try {
      await registerManualExchangeRate(tripId, manualRate);
      isRateRegistered = true;
      return { rateError: false };
    } catch (cause) {
      if (parseApiError(cause)?.code === 'EXCHANGE_RATE_DUPLICATED') {
        isRateRegistered = true;
        return { rateError: false };
      }
      return { rateError: true };
    }
  }
  return { submit };
}
