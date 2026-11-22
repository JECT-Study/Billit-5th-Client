import {
  formatTripDateRange,
  formatTripSpentAmount,
  getTripDisplayStatus,
  getTripElapsedRatio,
} from '@/features/trip/tripListDisplay';

const trip = {
  status: 'CONFIRMED' as const,
  startDate: '2026-10-12',
  endDate: '2026-10-18',
};

describe('tripListDisplay', () => {
  it('종료일이 지났으면 종료로 본다', () => {
    expect(getTripDisplayStatus(trip, '2026-10-19')).toBe('ENDED');
  });

  it('미확정 여행은 날짜와 관계없이 초대중으로 본다', () => {
    expect(
      getTripDisplayStatus({ ...trip, status: 'UNCONFIRMED' }, '2026-10-01'),
    ).toBe('INVITING');
    expect(
      getTripDisplayStatus({ ...trip, status: 'UNCONFIRMED' }, '2026-10-19'),
    ).toBe('INVITING');
  });

  it('확정되고 시작 전이면 예정, 기간 안이면 진행중으로 본다', () => {
    expect(getTripDisplayStatus(trip, '2026-10-01')).toBe('UPCOMING');
    expect(getTripDisplayStatus(trip, '2026-10-12')).toBe('ONGOING');
    expect(getTripDisplayStatus(trip, '2026-10-18')).toBe('ONGOING');
  });

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
