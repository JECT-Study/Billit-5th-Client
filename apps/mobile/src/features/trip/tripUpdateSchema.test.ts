import {
  toTripUpdateDraft,
  type TripUpdateDraft,
} from '@/features/trip/services/tripUpdateRequest';
import type { TripSummary } from '@/features/trip/tripSummarySchema';
import {
  isTripMemberCapacityValid,
  isTripUpdateDraftValid,
} from '@/features/trip/tripUpdateSchema';

const trip: TripSummary = {
  tripId: 'trip-1',
  name: '도쿄 여행',
  countryCode: 'JP',
  customCountryName: null,
  startDate: '2026-12-01',
  endDate: '2026-12-05',
  baseCurrency: 'JPY',
  memberCapacity: 4,
  registeredMemberCount: 3,
  status: 'UNCONFIRMED',
  myRole: 'ADMIN',
};

function isValid(changes: Partial<TripUpdateDraft>, original = trip) {
  return isTripUpdateDraftValid(original, {
    ...toTripUpdateDraft(original),
    ...changes,
  });
}

describe('isTripMemberCapacityValid', () => {
  it.each([
    [3, 3, true],
    [10, 3, true],
    [2, 3, false],
    [11, 3, false],
    [1, 0, true],
    [0, 0, false],
  ])('총인원 %s, 참여 인원 %s → %s', (capacity, registered, expected) => {
    expect(isTripMemberCapacityValid(capacity, registered)).toBe(expected);
  });
});

describe('isTripUpdateDraftValid', () => {
  it('서버에서 받은 값 그대로면 올바르다', () => {
    expect(isValid({})).toBe(true);
  });

  it('여행명은 15자까지 받는다', () => {
    expect(isValid({ name: '가'.repeat(15) })).toBe(true);
    expect(isValid({ name: '가'.repeat(16) })).toBe(false);
  });

  it('비어 있거나 특수문자가 든 여행명은 거절한다', () => {
    expect(isValid({ name: '   ' })).toBe(false);
    expect(isValid({ name: '도쿄!' })).toBe(false);
  });

  it('기타 국가는 국가명이 있어야 한다', () => {
    expect(isValid({ countryCode: 'ETC', customCountryName: '' })).toBe(false);
    expect(isValid({ countryCode: 'ETC', customCountryName: '태국' })).toBe(
      true,
    );
  });

  it('종료일이 비었거나 시작일보다 앞서면 거절한다', () => {
    expect(isValid({ endDate: '' })).toBe(false);
    expect(isValid({ endDate: '2026-11-30' })).toBe(false);
  });

  it('확정 전에는 총인원이 참여 인원 이상, 10명 이하여야 한다', () => {
    expect(isValid({ memberCapacity: 2 })).toBe(false);
    expect(isValid({ memberCapacity: 11 })).toBe(false);
    expect(isValid({ memberCapacity: 3 })).toBe(true);
  });

  it('확정 후에는 총인원을 검사하지 않는다', () => {
    const confirmedTrip: TripSummary = { ...trip, status: 'CONFIRMED' };

    expect(isValid({ memberCapacity: 1 }, confirmedTrip)).toBe(true);
  });
});
