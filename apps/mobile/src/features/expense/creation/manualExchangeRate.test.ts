import {
  hasChangedReferenceExchangeRate,
  makeManualExchangeRateRequest,
} from './manualExchangeRate';

it('기준 환율과 실제로 다른 수동 입력만 변경으로 판단한다', () => {
  expect(hasChangedReferenceExchangeRate(null, '9.00')).toBe(false);
  expect(hasChangedReferenceExchangeRate('9', '9.00')).toBe(false);
  expect(hasChangedReferenceExchangeRate('9.01', '9.00')).toBe(true);
  expect(hasChangedReferenceExchangeRate('9', undefined)).toBe(true);
});

it('직접 바꾼 현금·트래블카드 환율만 결제일로 등록한다', () => {
  expect(
    makeManualExchangeRateRequest('USD', 'CASH', '2026-11-05', '1300.00', true),
  ).toEqual({
    currency: 'USD',
    rate: '1300.00',
    exchangeMethod: 'CASH',
    exchangeDate: '2026-11-05',
  });
  expect(
    makeManualExchangeRateRequest(
      'JPY',
      'TRAVEL_CARD',
      '2026-11-05',
      '9.00',
      true,
    )?.exchangeMethod,
  ).toBe('TRAVEL_CARD');
  expect(
    makeManualExchangeRateRequest('USD', 'CARD', '2026-11-05', '1300.00', true),
  ).toBeNull();
  expect(
    makeManualExchangeRateRequest('KRW', 'CASH', '2026-11-05', '1.00', true),
  ).toBeNull();
  expect(
    makeManualExchangeRateRequest(
      'USD',
      'CASH',
      '2026-11-05',
      '1300.00',
      false,
    ),
  ).toBeNull();
});
