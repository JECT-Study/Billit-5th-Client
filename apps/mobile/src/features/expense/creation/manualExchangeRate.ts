import type { PaymentMethod } from '@/features/expense/services/expenseApi';
import type { ManualExchangeRateRequest } from '@/features/exchangeRate/services/exchangeRateApi';
import type { Currency } from '@/shared/currency';
import { parseDecimal } from '@/features/expense/creation/expenseCalculation';

export function hasChangedReferenceExchangeRate(
  manualRate: string | null,
  referenceRate: string | undefined,
) {
  if (manualRate === null) return false;
  const referenceValue = referenceRate ? parseDecimal(referenceRate) : null;
  return referenceValue === null || parseDecimal(manualRate) !== referenceValue;
}

export function makeManualExchangeRateRequest(
  currency: Currency,
  paymentMethod: PaymentMethod,
  paidDate: string,
  rate: string,
  isChanged: boolean,
): ManualExchangeRateRequest | null {
  if (!isChanged || currency === 'KRW' || paymentMethod === 'CARD') return null;
  return {
    currency,
    rate,
    exchangeMethod: paymentMethod,
    exchangeDate: paidDate,
  };
}
