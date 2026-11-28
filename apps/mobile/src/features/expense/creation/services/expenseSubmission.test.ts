import { createExpenseSubmission } from './expenseSubmission';
import {
  createExpense,
  type ExpenseRequest,
} from '@/features/expense/services/expenseApi';
import {
  registerManualExchangeRate,
  type ManualExchangeRateRequest,
} from '@/features/exchangeRate/services/exchangeRateApi';
import { parseApiError } from '@/lib/apiError';

jest.mock('@/features/expense/services/expenseApi', () => ({
  createExpense: jest.fn(),
}));
jest.mock('@/features/exchangeRate/services/exchangeRateApi', () => ({
  registerManualExchangeRate: jest.fn(),
}));
jest.mock('@/lib/apiError', () => ({ parseApiError: jest.fn() }));
const request: ExpenseRequest = {
  name: '식사',
  splitType: 'EQUAL',
  currency: 'JPY',
  paidDate: '2026-11-05',
  paymentMethod: 'CASH',
  payerTripMemberId: '1',
  originalAmount: '100.00',
  discountAmount: '0.00',
  exchangeRate: '9.00',
  exchangeRateSource: 'MANUAL',
  tripMemberIds: ['1'],
};
const rate: ManualExchangeRateRequest = {
  currency: 'JPY',
  rate: '9.00',
  exchangeMethod: 'CASH',
  exchangeDate: '2026-11-05',
};

beforeEach(() => {
  jest.resetAllMocks();
});

it('지출 저장에 실패하면 환율을 등록하지 않고 같은 키로 재시도한다', async () => {
  jest
    .mocked(createExpense)
    .mockRejectedValueOnce(new Error('network'))
    .mockResolvedValue({ expenseId: '10' });
  jest
    .mocked(registerManualExchangeRate)
    .mockResolvedValue({ exchangeRateId: '20', rate: '9.00' });
  const onSaved = jest.fn();
  const submission = createExpenseSubmission(
    '123',
    request,
    rate,
    'same-key',
    onSaved,
  );
  await expect(submission.submit()).rejects.toThrow('network');
  expect(registerManualExchangeRate).not.toHaveBeenCalled();
  await expect(submission.submit()).resolves.toEqual({ rateError: false });
  expect(createExpense).toHaveBeenCalledTimes(2);
  expect(createExpense).toHaveBeenNthCalledWith(1, '123', request, 'same-key');
  expect(createExpense).toHaveBeenNthCalledWith(2, '123', request, 'same-key');
  expect(onSaved).toHaveBeenCalledTimes(1);
  expect(registerManualExchangeRate).toHaveBeenCalledWith('123', rate);
});

it('환율 등록에 실패하면 지출을 다시 만들지 않고 환율만 재시도한다', async () => {
  jest.mocked(createExpense).mockResolvedValue({ expenseId: '10' });
  jest
    .mocked(registerManualExchangeRate)
    .mockRejectedValueOnce(new Error('network'))
    .mockResolvedValue({ exchangeRateId: '20', rate: '9.00' });
  const onSaved = jest.fn();
  const submission = createExpenseSubmission(
    '123',
    request,
    rate,
    'same-key',
    onSaved,
  );
  await expect(submission.submit()).resolves.toEqual({ rateError: true });
  await expect(submission.submit()).resolves.toEqual({ rateError: false });
  expect(createExpense).toHaveBeenCalledTimes(1);
  expect(registerManualExchangeRate).toHaveBeenCalledTimes(2);
  expect(onSaved).toHaveBeenCalledTimes(1);
});

it('중복 환율 응답은 이미 등록된 것으로 처리한다', async () => {
  jest.mocked(createExpense).mockResolvedValue({ expenseId: '10' });
  jest
    .mocked(registerManualExchangeRate)
    .mockRejectedValue(new Error('duplicate'));
  jest.mocked(parseApiError).mockReturnValue({
    status: 409,
    code: 'EXCHANGE_RATE_DUPLICATED',
    message: null,
    errors: null,
  });
  const submission = createExpenseSubmission(
    '123',
    request,
    rate,
    'same-key',
    jest.fn(),
  );
  await expect(submission.submit()).resolves.toEqual({ rateError: false });
  await submission.submit();
  expect(registerManualExchangeRate).toHaveBeenCalledTimes(1);
});

it('자동 환율에는 개인 환율 등록을 호출하지 않는다', async () => {
  jest.mocked(createExpense).mockResolvedValue({ expenseId: '10' });
  const submission = createExpenseSubmission(
    '123',
    request,
    null,
    'same-key',
    jest.fn(),
  );
  await submission.submit();
  expect(registerManualExchangeRate).not.toHaveBeenCalled();
});
