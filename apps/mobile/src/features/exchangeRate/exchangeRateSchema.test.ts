import {
  manualExchangeRateSchema,
  referenceExchangeRateSchema,
} from './exchangeRateSchema';

const referenceRate = {
  currency: 'JPY',
  rate: '9.12',
  provider: 'ECB',
  baseDate: '2026-11-05',
};

it('기준 환율의 통화, 금액 형식과 기준일을 확인한다', () => {
  expect(referenceExchangeRateSchema.safeParse(referenceRate).success).toBe(
    true,
  );
  expect(
    referenceExchangeRateSchema.safeParse({ ...referenceRate, currency: 'KRW' })
      .success,
  ).toBe(false);
  expect(
    referenceExchangeRateSchema.safeParse({ ...referenceRate, rate: '9.1' })
      .success,
  ).toBe(false);
  expect(
    referenceExchangeRateSchema.safeParse({
      ...referenceRate,
      baseDate: '2026-02-30',
    }).success,
  ).toBe(false);
});

it('환율 등록 응답에서 문자열 ID와 환율을 확인한다', () => {
  expect(
    manualExchangeRateSchema.safeParse({ exchangeRateId: '5', rate: '9.12' })
      .success,
  ).toBe(true);
  expect(
    manualExchangeRateSchema.safeParse({ exchangeRateId: 5, rate: '9.12' })
      .success,
  ).toBe(false);
});
