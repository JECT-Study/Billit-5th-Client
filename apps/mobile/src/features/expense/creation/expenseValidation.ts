import { parseDecimal } from '@/features/expense/creation/expenseCalculation';
import type { Currency } from '@/shared/currency';
import type { Participant } from '@/features/trip/tripDetailSchema';

type RequiredExpenseFields = {
  name: string;
  amount: string;
  currency: string | undefined;
  exchangeRate: string;
  payerId: string | null;
  participantIds: string[];
};

export function hasMissingExpenseFields(
  fields: RequiredExpenseFields,
): boolean {
  return (
    !fields.name.trim() ||
    !fields.amount.trim() ||
    !fields.currency ||
    !fields.exchangeRate.trim() ||
    !fields.payerId ||
    fields.participantIds.length === 0
  );
}
export const EXPENSE_NAME_MAX_LENGTH = 20;

type ExpenseValidationInput = {
  tripId: string | undefined;
  tripStatus: string | undefined;
  currency: Currency | undefined;
  name: string;
  amount: string;
  discount: string;
  exchangeRate: string;
  participants: Participant[];
  participantIds: string[];
  payerId: string | null;
  isRateFetching: boolean;
};

export function validateExpense(input: ExpenseValidationInput) {
  const decimals = input.currency === 'KRW' || input.currency === 'JPY' ? 0 : 2;
  const original = parseDecimal(input.amount, decimals);
  const discounted = parseDecimal(input.discount || '0', decimals);
  const rate = parseDecimal(input.exchangeRate);
  const payer = input.participants.find(
    (p) => p.tripMemberId === input.payerId,
  );
  const isValid = Boolean(
    input.tripId &&
    input.tripStatus === 'CONFIRMED' &&
    input.currency &&
    input.name.trim() &&
    input.name.length <= EXPENSE_NAME_MAX_LENGTH &&
    original !== null &&
    discounted !== null &&
    discounted <= original &&
    rate !== null &&
    rate > 0n &&
    ((original - discounted) * rate + 5000n) / 10000n < 10000000000n &&
    input.participantIds.length > 0 &&
    input.participantIds.every((id) =>
      input.participants.some((p) => p.tripMemberId === id),
    ) &&
    payer?.participantStatus === 'MEMBER' &&
    !input.isRateFetching,
  );
  return { original, discounted, rate, isValid };
}
