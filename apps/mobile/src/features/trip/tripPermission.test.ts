import {
  canAddExpense,
  canChangeTripCapacity,
  canDeleteTrip,
  canEditTrip,
  canOpenTripDetail,
  canStartSettlement,
} from '@/features/trip/tripPermission';

describe('tripPermission', () => {
  it.each([
    ['ADMIN', 'UNCONFIRMED', true, true, true, false, false],
    ['ADMIN', 'CONFIRMED', true, false, true, true, true],
    ['MEMBER', 'UNCONFIRMED', false, false, false, false, false],
    ['MEMBER', 'CONFIRMED', false, false, false, false, true],
  ] as const)(
    '%s · %s: 수정 %s, 인원 변경 %s, 삭제 %s, 정산 시작 %s, 지출 등록 %s',
    (myRole, status, edit, capacity, remove, settlement, addExpense) => {
      const trip = { myRole, status };

      expect(canEditTrip(trip)).toBe(edit);
      expect(canChangeTripCapacity(trip)).toBe(capacity);
      expect(canDeleteTrip(trip)).toBe(remove);
      expect(canStartSettlement(trip)).toBe(settlement);
      expect(canAddExpense(trip)).toBe(addExpense);
    },
  );

  it.each([
    ['CONFIRMED', true],
    ['UNCONFIRMED', false],
  ] as const)('%s 여행의 상세 진입: %s', (status, expected) => {
    expect(canOpenTripDetail({ status })).toBe(expected);
  });
});
