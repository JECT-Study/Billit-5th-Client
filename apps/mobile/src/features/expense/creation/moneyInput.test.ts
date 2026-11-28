import { formatMoneyInput, unformatMoneyInput } from './moneyInput';

it('정수부에만 쉼표를 넣고 입력 중인 소수점을 보존한다', () => {
  expect(formatMoneyInput('')).toBe('');
  expect(formatMoneyInput('1000')).toBe('1,000');
  expect(formatMoneyInput('1234567.00')).toBe('1,234,567.00');
  expect(formatMoneyInput('1234.')).toBe('1,234.');
  expect(formatMoneyInput('0.01')).toBe('0.01');
  expect(unformatMoneyInput('1,234,567.00')).toBe('1234567.00');
});
