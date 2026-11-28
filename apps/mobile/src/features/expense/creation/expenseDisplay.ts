import { formatMoneyInput } from '@/features/expense/creation/moneyInput';
import type { Currency } from '@/shared/currency';
import { CURRENCY_SYMBOLS } from '@/shared/currency';

export function formatExpenseAmount(amount: string, currency: Currency) {
  const displayAmount = amount.endsWith('.00') ? amount.slice(0, -3) : amount;
  return `${CURRENCY_SYMBOLS[currency]}${formatMoneyInput(displayAmount)}`;
}

export function formatKrwAmount(amount: string) {
  return `${formatMoneyInput(amount)}원`;
}
