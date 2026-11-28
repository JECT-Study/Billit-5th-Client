import { useQuery } from '@tanstack/react-query';

import { exchangeRateKeys } from '@/features/exchangeRate/exchangeRateKeys';
import {
  getReferenceExchangeRate,
  type ForeignCurrency,
} from '@/features/exchangeRate/services/exchangeRateApi';
import type { Currency } from '@/shared/currency';

export function useReferenceExchangeRate(
  currency: Currency | undefined,
  paidDate: string,
  isEnabled: boolean,
) {
  return useQuery({
    queryKey: exchangeRateKeys.reference(currency, paidDate),
    queryFn: () =>
      getReferenceExchangeRate(currency as ForeignCurrency, paidDate),
    enabled: isEnabled,
    retry: false,
  });
}
