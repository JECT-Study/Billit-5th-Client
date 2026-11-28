import { apiClient } from '@/lib/api';
import {
  referenceExchangeRateSchema,
  manualExchangeRateSchema,
  type ReferenceExchangeRate,
  type ManualExchangeRate,
} from '@/features/exchangeRate/exchangeRateSchema';
import type { Currency } from '@/shared/currency';

export type ForeignCurrency = Exclude<Currency, 'KRW'>;
export type ManualExchangeRateRequest = {
  currency: ForeignCurrency;
  rate: string;
  exchangeMethod: 'CASH' | 'TRAVEL_CARD';
  exchangeDate: string;
};

export async function getReferenceExchangeRate(
  currency: ForeignCurrency,
  paidDate: string,
): Promise<ReferenceExchangeRate> {
  const response = await apiClient.get<{ data: unknown }>(
    '/api/v1/reference-exchange-rates',
    { params: { currency, paidDate } },
  );
  const rate = referenceExchangeRateSchema.parse(response.data.data);
  if (rate.currency !== currency)
    throw new Error('환율 통화가 일치하지 않습니다.');
  return rate;
}

export async function registerManualExchangeRate(
  tripId: string,
  request: ManualExchangeRateRequest,
): Promise<ManualExchangeRate> {
  const response = await apiClient.post<{ data: unknown }>(
    `/api/v1/trips/${encodeURIComponent(tripId)}/exchange-rates`,
    request,
  );
  return manualExchangeRateSchema.parse(response.data.data);
}
