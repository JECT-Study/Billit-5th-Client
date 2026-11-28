import { hasMissingExpenseFields, validateExpense } from './expenseValidation';
import type { Participant } from '@/features/trip/tripDetailSchema';

const complete = {
  name: '식사',
  amount: '0',
  currency: 'KRW',
  exchangeRate: '1.00',
  payerId: '1',
  participantIds: ['1'],
};

it('0원을 입력한 지출도 필수값이 채워진 것으로 판단한다', () => {
  expect(hasMissingExpenseFields(complete)).toBe(false);
});

it('통화 단위, 할인 금액과 참여자 자격을 검증한다', () => {
  const participant: Participant = {
    tripMemberId: '1',
    memberId: '1',
    tripNickname: '나',
    role: 'MEMBER',
    participantStatus: 'MEMBER',
    shareAmountKrw: '0.00',
  };
  const input = {
    tripId: '1',
    tripStatus: 'CONFIRMED',
    currency: 'KRW' as const,
    name: '식사',
    amount: '100',
    discount: '10',
    exchangeRate: '1',
    participants: [participant],
    participantIds: ['1'],
    payerId: '1',
    isRateFetching: false,
  };
  expect(validateExpense(input).isValid).toBe(true);
  expect(validateExpense({ ...input, amount: '100.50' }).isValid).toBe(false);
  expect(validateExpense({ ...input, discount: '101' }).isValid).toBe(false);
  expect(validateExpense({ ...input, participantIds: ['2'] }).isValid).toBe(
    false,
  );
  expect(
    validateExpense({
      ...input,
      participants: [{ ...participant, participantStatus: 'GUEST' }],
    }).isValid,
  ).toBe(false);
  expect(validateExpense({ ...input, isRateFetching: true }).isValid).toBe(
    false,
  );
});

it('지출명, 금액, 통화, 환율, 결제자, 정산 대상자 중 하나라도 빠지면 필수값 누락으로 판단한다', () => {
  expect(hasMissingExpenseFields({ ...complete, name: '  ' })).toBe(true);
  expect(hasMissingExpenseFields({ ...complete, amount: '' })).toBe(true);
  expect(hasMissingExpenseFields({ ...complete, currency: undefined })).toBe(
    true,
  );
  expect(hasMissingExpenseFields({ ...complete, exchangeRate: '' })).toBe(true);
  expect(hasMissingExpenseFields({ ...complete, payerId: null })).toBe(true);
  expect(hasMissingExpenseFields({ ...complete, participantIds: [] })).toBe(
    true,
  );
});
