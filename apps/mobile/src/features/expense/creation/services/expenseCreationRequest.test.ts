import { makeExpenseCreationRequest } from './expenseCreationRequest';

const input = {
  name: ' 식사 ',
  currency: 'EUR' as const,
  paidDate: '2026-11-27',
  payment: '현금',
  payerId: '1',
  original: 2500000n,
  discounted: 10000n,
  rate: 146265n,
  isRateAuto: false,
  isManualRateChanged: true,
  participantIds: ['1', '2'],
};

it('입력값을 지출 요청과 직접 입력 환율 요청으로 변환한다', () => {
  const result = makeExpenseCreationRequest(input);
  expect(result.request).toMatchObject({
    name: '식사',
    paymentMethod: 'CASH',
    originalAmount: '25000.00',
    discountAmount: '100.00',
    exchangeRate: '1462.65',
    exchangeRateSource: 'MANUAL',
    tripMemberIds: ['1', '2'],
  });
  expect(result.manualRateRequest).toEqual({
    currency: 'EUR',
    rate: '1462.65',
    exchangeMethod: 'CASH',
    exchangeDate: '2026-11-27',
  });
});

it('카드 결제나 자동 환율은 별도의 내 환율 등록 요청을 만들지 않는다', () => {
  expect(
    makeExpenseCreationRequest({ ...input, payment: '카드' }).manualRateRequest,
  ).toBeNull();
  expect(
    makeExpenseCreationRequest({
      ...input,
      isRateAuto: true,
      isManualRateChanged: false,
    }).manualRateRequest,
  ).toBeNull();
});
