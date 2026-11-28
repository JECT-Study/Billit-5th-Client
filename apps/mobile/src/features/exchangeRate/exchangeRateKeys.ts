import type { Currency } from '@/shared/currency';

export const exchangeRateKeys = {
  reference: (currency: Currency | undefined, paidDate: string) =>
    ['reference-exchange-rate', currency, paidDate] as const,
};
