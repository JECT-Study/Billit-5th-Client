import { apiClient } from '@/lib/api';
import {
  expenseResponseSchema,
  type ExpenseResponse,
} from '@/features/expense/expenseSchema';
import type { Currency } from '@/shared/currency';

export type PaymentMethod = 'CASH' | 'CARD' | 'TRAVEL_CARD';
export type ExpenseRequest = {
  name: string;
  splitType: 'EQUAL';
  currency: Currency;
  paidDate: string;
  paymentMethod: PaymentMethod;
  payerTripMemberId: string;
  originalAmount: string;
  discountAmount: string;
  exchangeRate: string;
  exchangeRateSource: 'AUTO' | 'MANUAL';
  tripMemberIds: string[];
};

export async function createExpense(
  tripId: string,
  request: ExpenseRequest,
  idempotencyKey: string,
): Promise<ExpenseResponse> {
  const response = await apiClient.post<{ data: unknown }>(
    `/api/v1/trips/${encodeURIComponent(tripId)}/expenses`,
    request,
    { headers: { 'Idempotency-Key': idempotencyKey } },
  );
  return expenseResponseSchema.parse(response.data.data);
}
