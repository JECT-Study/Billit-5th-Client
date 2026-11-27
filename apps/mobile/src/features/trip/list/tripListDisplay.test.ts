import {
  formatTripDateRange,
  formatKrw,
  formatTripSpentAmount,
  getTripElapsedRatio,
} from '@/features/trip/list/tripListDisplay';

const trip = {
  startDate: '2026-10-12',
  endDate: '2026-10-18',
};

describe('tripListDisplay', () => {
  it('여행 기간 중 지나간 비율을 0~1로 계산한다', () => {
    expect(getTripElapsedRatio(trip, '2026-10-01')).toBe(0);
    expect(getTripElapsedRatio(trip, '2026-10-15')).toBe(0.5);
    expect(getTripElapsedRatio(trip, '2026-10-30')).toBe(1);
  });

  it('날짜 범위와 금액을 화면 형식으로 바꾼다', () => {
    expect(formatTripDateRange('2026-10-24', '2026-11-12')).toBe(
      '2026.10.24~2026.11.12',
    );
    expect(formatTripSpentAmount('100000.00')).toBe('100,000원 사용');
    expect(formatTripSpentAmount('0.00')).toBe('0원 사용');
  });
});

describe('formatKrw', () => {
  it.each([
    ['88000.00', '88,000원'],
    ['0.00', '0원'],
    ['999.00', '999원'],
    ['1000.00', '1,000원'],
    ['1234567.89', '1,234,567원'],
    ['-5000.00', '-5,000원'],
  ])('%s → %s', (amount, expected) => {
    expect(formatKrw(amount)).toBe(expected);
  });
});
