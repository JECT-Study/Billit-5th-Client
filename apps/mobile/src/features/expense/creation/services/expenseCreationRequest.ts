import { decimalString } from '@/features/expense/creation/expenseCalculation';
import { makeManualExchangeRateRequest } from '@/features/expense/creation/manualExchangeRate';
import type {
  ExpenseRequest,
  PaymentMethod,
} from '@/features/expense/services/expenseApi';
import type { Currency } from '@/shared/currency';

type ExpenseCreationInput = {
  name: string;
  currency: Currency;
  paidDate: string;
  payment: string;
  payerId: string;
  original: bigint;
  discounted: bigint;
  rate: bigint;
  isRateAuto: boolean;
  isManualRateChanged: boolean;
  participantIds: string[];
};

export function makeExpenseCreationRequest(input: ExpenseCreationInput) {
  const paymentMethod: PaymentMethod =
    input.payment === '카드'
      ? 'CARD'
      : input.payment === '현금'
        ? 'CASH'
        : 'TRAVEL_CARD';
  const rate = decimalString(input.rate);
  const request: ExpenseRequest = {
    name: input.name.trim(),
    splitType: 'EQUAL',
    currency: input.currency,
    paidDate: input.paidDate,
    paymentMethod,
    payerTripMemberId: input.payerId,
    originalAmount: decimalString(input.original),
    discountAmount: decimalString(input.discounted),
    exchangeRate: rate,
    exchangeRateSource: input.isRateAuto ? 'AUTO' : 'MANUAL',
    tripMemberIds: input.participantIds,
  };
  return {
    request,
    manualRateRequest: makeManualExchangeRateRequest(
      input.currency,
      paymentMethod,
      input.paidDate,
      rate,
      input.isManualRateChanged,
    ),
  };
}
