import {
  buildTripUpdateRequest,
  hasTripUpdateChanges,
  toTripUpdateDraft,
  type TripUpdateDraft,
} from '@/features/trip/settings/services/tripUpdateRequest';
import type { TripSummary } from '@/features/trip/tripSummarySchema';

const trip: TripSummary = {
  tripId: 'trip-1',
  name: '도쿄 여행',
  countryCode: 'JP',
  customCountryName: null,
  startDate: '2026-12-01',
  endDate: '2026-12-05',
  baseCurrency: 'JPY',
  memberCapacity: 4,
  registeredMemberCount: 2,
  status: 'UNCONFIRMED',
  myRole: 'ADMIN',
};

const etcTrip: TripSummary = {
  ...trip,
  countryCode: 'ETC',
  customCountryName: '태국',
  baseCurrency: 'KRW',
};

function build(original: TripSummary, changes: Partial<TripUpdateDraft>) {
  return buildTripUpdateRequest(original, {
    ...toTripUpdateDraft(original),
    ...changes,
  });
}

describe('toTripUpdateDraft', () => {
  it('국가명이 없으면 빈 문자열로 채운다', () => {
    expect(toTripUpdateDraft(trip).customCountryName).toBe('');
    expect(toTripUpdateDraft(etcTrip).customCountryName).toBe('태국');
  });
});

describe('buildTripUpdateRequest', () => {
  it('바꾸지 않으면 빈 요청을 만든다', () => {
    const request = build(trip, {});

    expect(request).toEqual({});
    expect(hasTripUpdateChanges(request)).toBe(false);
  });

  it('바뀐 필드만 담는다', () => {
    const request = build(trip, {
      baseCurrency: 'KRW',
      endDate: '2026-12-06',
      memberCapacity: 5,
    });

    expect(request).toEqual({
      baseCurrency: 'KRW',
      endDate: '2026-12-06',
      memberCapacity: 5,
    });
    expect(hasTripUpdateChanges(request)).toBe(true);
  });

  it('이름은 앞뒤 공백을 지운 값으로 비교하고 보낸다', () => {
    expect(build(trip, { name: '  도쿄 여행 ' })).toEqual({});
    expect(build(trip, { name: ' 오사카 여행 ' })).toEqual({
      name: '오사카 여행',
    });
  });

  it('국가를 바꿔도 통화는 따로 바꾸지 않는다', () => {
    expect(build(trip, { countryCode: 'US' })).toEqual({ countryCode: 'US' });
  });

  it('ETC로 바꾸면 국가명을 함께 보낸다', () => {
    expect(
      build(trip, { countryCode: 'ETC', customCountryName: ' 태국 ' }),
    ).toEqual({ countryCode: 'ETC', customCountryName: '태국' });
  });

  it('ETC에서 다른 국가로 바꾸면 국가명을 보내지 않는다', () => {
    expect(
      build(etcTrip, { countryCode: 'KR', customCountryName: '태국' }),
    ).toEqual({ countryCode: 'KR' });
  });

  it('ETC 국가명만 바꾸면 국가명만 보낸다', () => {
    expect(build(etcTrip, { customCountryName: '베트남' })).toEqual({
      customCountryName: '베트남',
    });
    expect(build(etcTrip, { customCountryName: ' 태국 ' })).toEqual({});
  });

  it('ETC가 아닌 국가는 국가명 입력값이 있어도 보내지 않는다', () => {
    expect(build(trip, { customCountryName: '태국' })).toEqual({});
  });

  it('확정된 여행은 인원을 보내지 않는다', () => {
    const confirmedTrip: TripSummary = { ...trip, status: 'CONFIRMED' };

    expect(
      build(confirmedTrip, { memberCapacity: 6, name: '새 이름' }),
    ).toEqual({ name: '새 이름' });
  });
});
