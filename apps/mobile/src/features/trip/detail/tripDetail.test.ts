import { AxiosError, type InternalAxiosRequestConfig } from 'axios';

import {
  getTripDetailLoadErrorNotice,
  getTripDetailNotice,
} from '@/features/trip/detail/tripDetail';
import type { TripDetail } from '@/features/trip/tripDetailSchema';

function apiError(status: number, body: Record<string, string> = {}) {
  const config = { headers: {} } as InternalAxiosRequestConfig;
  return new AxiosError('error', undefined, config, undefined, {
    config,
    data: body,
    headers: {},
    status,
    statusText: '',
  });
}

const networkError = new AxiosError('Network Error', AxiosError.ERR_NETWORK);

function createTrip(overrides: Partial<TripDetail> = {}): TripDetail {
  return {
    tripId: 'trip-1',
    name: '도쿄 여행',
    countryCode: 'JP',
    customCountryName: null,
    startDate: '2026-11-05',
    endDate: '2026-11-07',
    baseCurrency: 'JPY',
    memberCapacity: 2,
    registeredMemberCount: 2,
    status: 'CONFIRMED',
    myRole: 'ADMIN',
    participants: [],
    ...overrides,
  };
}

describe('getTripDetailLoadErrorNotice', () => {
  it('삭제된 여행은 안내 후 여행 목록으로 간다', () => {
    expect(getTripDetailLoadErrorNotice(apiError(404))).toEqual({
      message: '삭제된 여행이에요.',
      exitTo: 'trips',
    });
  });

  it('접근할 수 없는 여행도 뒤가 아니라 여행 목록으로 간다', () => {
    expect(getTripDetailLoadErrorNotice(apiError(403))).toEqual({
      message: '이 여행방에 접근할 수 없어요.',
      exitTo: 'trips',
    });
  });

  it('그 밖의 실패는 서버 메시지를 먼저 쓰고 뒤로 간다', () => {
    expect(
      getTripDetailLoadErrorNotice(
        apiError(500, { message: '서버 오류입니다.' }),
      ),
    ).toEqual({ message: '서버 오류입니다.', exitTo: 'back' });
  });

  it('서버 메시지가 없으면 기본 문구를 쓴다', () => {
    expect(getTripDetailLoadErrorNotice(networkError)).toEqual({
      message: '여행 정보를 불러오지 못했어요. 다시 시도해주세요.',
      exitTo: 'back',
    });
  });
});

describe('getTripDetailNotice', () => {
  it('라우트에 tripId가 없으면 삭제 안내를 띄운다', () => {
    expect(
      getTripDetailNotice({ tripId: undefined, trip: undefined, error: null }),
    ).toMatchObject({ exitTo: 'trips' });
  });

  it('조회 중이면 안내가 없다', () => {
    expect(
      getTripDetailNotice({ tripId: 'trip-1', trip: undefined, error: null }),
    ).toBeNull();
  });

  it('시작된 여행이면 안내 없이 본문을 보여 준다', () => {
    expect(
      getTripDetailNotice({
        tripId: 'trip-1',
        trip: createTrip(),
        error: null,
      }),
    ).toBeNull();
  });

  it('확정 전 여행에 딥링크로 들어오면 안내 후 여행 목록으로 간다', () => {
    expect(
      getTripDetailNotice({
        tripId: 'trip-1',
        trip: createTrip({ status: 'UNCONFIRMED' }),
        error: null,
      }),
    ).toEqual({ message: '아직 시작하지 않은 여행이에요.', exitTo: 'trips' });
  });

  it('조회에 실패하면 오류에 맞는 안내를 띄운다', () => {
    expect(
      getTripDetailNotice({
        tripId: 'trip-1',
        trip: undefined,
        error: apiError(404),
      }),
    ).toEqual({ message: '삭제된 여행이에요.', exitTo: 'trips' });
  });
});
