import { formatExpenseAmount, formatKrwAmount } from './expenseDisplay';

it('소수점이 있는 금액을 보존하면서 통화 기호와 쉼표를 표시한다', () => {
  expect(formatExpenseAmount('250.00', 'EUR')).toBe('€250');
  expect(formatExpenseAmount('1234.50', 'USD')).toBe('$1,234.50');
  expect(formatExpenseAmount('1000000.00', 'KRW')).toBe('₩1,000,000');
  expect(formatKrwAmount('365663')).toBe('365,663원');
});
