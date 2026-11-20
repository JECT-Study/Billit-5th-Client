import {
  getTripCreationAttempt,
  toCreateTripRequest,
} from '@/features/trip/services/tripCreationRequest';
import type { TripCreationValues } from '@/features/trip/tripCreationSchema';

const values: TripCreationValues = {
  name: '도쿄 여행',
  countryCode: 'JP',
  customCountryName: '이전 입력',
  baseCurrency: 'JPY',
  startDate: '2026-12-01',
  endDate: '2026-12-05',
  memberCapacity: 3,
  nickname: '민서',
};

describe('toCreateTripRequest', () => {
  it('기본 국가 선택 시 이전에 입력한 기타 국가명을 보내지 않는다', () => {
    expect(toCreateTripRequest(values)).toEqual({
      name: '도쿄 여행',
      countryCode: 'JP',
      baseCurrency: 'JPY',
      startDate: '2026-12-01',
      endDate: '2026-12-05',
      memberCapacity: 3,
      nickname: '민서',
    });
  });

  it('기타 국가 선택 시 직접 입력한 국가명을 보낸다', () => {
    expect(
      toCreateTripRequest({
        ...values,
        countryCode: 'ETC',
        customCountryName: ' 대만 ',
      }),
    ).toMatchObject({ countryCode: 'ETC', customCountryName: '대만' });
  });
});

describe('getTripCreationAttempt', () => {
  it('같은 요청 재시도에는 키를 재사용하고 입력 변경 시 새 키를 만든다', () => {
    const createKey = jest
      .fn()
      .mockReturnValueOnce('first-key')
      .mockReturnValueOnce('second-key');
    const request = toCreateTripRequest(values);
    const first = getTripCreationAttempt(request, null, createKey);
    const retry = getTripCreationAttempt({ ...request }, first, createKey);
    const changed = getTripCreationAttempt(
      { ...request, nickname: '새닉네임' },
      retry,
      createKey,
    );

    expect(retry).toBe(first);
    expect(changed.idempotencyKey).toBe('second-key');
    expect(createKey).toHaveBeenCalledTimes(2);
  });
});
