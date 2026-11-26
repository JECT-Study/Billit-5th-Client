import {
  canChangeTripCapacity,
  canDeleteTrip,
  canEditTrip,
  canStartSettlement,
} from '@/features/trip/tripPermission';

describe('tripPermission', () => {
  it.each([
    ['ADMIN', 'UNCONFIRMED', true, true, true, false],
    ['ADMIN', 'CONFIRMED', true, false, true, true],
    ['MEMBER', 'UNCONFIRMED', false, false, false, false],
    ['MEMBER', 'CONFIRMED', false, false, false, false],
  ] as const)(
    '%s · %s: 수정 %s, 인원 변경 %s, 삭제 %s, 정산 시작 %s',
    (myRole, status, edit, capacity, remove, settlement) => {
      const trip = { myRole, status };

      expect(canEditTrip(trip)).toBe(edit);
      expect(canChangeTripCapacity(trip)).toBe(capacity);
      expect(canDeleteTrip(trip)).toBe(remove);
      expect(canStartSettlement(trip)).toBe(settlement);
    },
  );
});
