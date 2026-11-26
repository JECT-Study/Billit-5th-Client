import { AxiosError, type InternalAxiosRequestConfig } from 'axios';

import {
  getTripDeleteErrorNotice,
  getTripLoadErrorNotice,
  getTripUpdateErrorNotice,
} from '@/features/trip/tripSettings';

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

describe('getTripLoadErrorNotice', () => {
  it('없는 여행은 삭제 안내 후 여행 목록으로 간다', () => {
    expect(getTripLoadErrorNotice(apiError(404))).toEqual({
      message: '삭제된 여행이에요.',
      exitTo: 'trips',
    });
  });

  it('참여하지 않는 여행은 안내 후 뒤로 간다', () => {
    expect(getTripLoadErrorNotice(apiError(403))).toEqual({
      message: '이 여행방에 접근할 수 없어요.',
      exitTo: 'back',
    });
  });

  it('그 밖의 실패는 서버 메시지를 먼저 쓰고 없으면 기본 문구를 쓴다', () => {
    expect(
      getTripLoadErrorNotice(apiError(500, { message: '서버 오류입니다.' })),
    ).toEqual({ message: '서버 오류입니다.', exitTo: 'back' });
    expect(getTripLoadErrorNotice(networkError)).toEqual({
      message: '여행 정보를 불러오지 못했어요. 다시 시도해주세요.',
      exitTo: 'back',
    });
  });
});

describe('getTripUpdateErrorNotice', () => {
  it('없는 여행은 삭제 안내 후 여행 목록으로 간다', () => {
    expect(getTripUpdateErrorNotice(apiError(404)).exitTo).toBe('trips');
  });

  it('관리자가 아니면 안내 후 뒤로 간다', () => {
    expect(getTripUpdateErrorNotice(apiError(403))).toEqual({
      message: '여행 관리자만 여행방을 설정할 수 있어요.',
      exitTo: 'back',
    });
  });

  it('인원 변경 불가는 화면에 남아 서버 메시지를 보여준다', () => {
    expect(
      getTripUpdateErrorNotice(
        apiError(409, {
          code: 'TRIP_CAPACITY_CHANGE_NOT_ALLOWED',
          message: '확정된 여행은 인원을 변경할 수 없습니다.',
        }),
      ),
    ).toEqual({
      message: '확정된 여행은 인원을 변경할 수 없습니다.',
      exitTo: null,
    });
    expect(
      getTripUpdateErrorNotice(
        apiError(409, { code: 'TRIP_CAPACITY_CHANGE_NOT_ALLOWED' }),
      ).message,
    ).toBe('지금은 여행 총인원을 바꿀 수 없어요.');
  });

  it('그 밖의 실패는 화면에 남아 다시 저장할 수 있다', () => {
    expect(
      getTripUpdateErrorNotice(
        apiError(400, { message: '여행명 형식이 올바르지 않습니다.' }),
      ),
    ).toEqual({ message: '여행명 형식이 올바르지 않습니다.', exitTo: null });
    expect(getTripUpdateErrorNotice(networkError)).toEqual({
      message: '여행 정보를 저장하지 못했어요. 다시 시도해주세요.',
      exitTo: null,
    });
  });
});

describe('getTripDeleteErrorNotice', () => {
  it('관리자가 아니면 안내 후 뒤로 간다', () => {
    expect(getTripDeleteErrorNotice(apiError(403))).toEqual({
      message: '여행 관리자만 여행방을 설정할 수 있어요.',
      exitTo: 'back',
    });
  });

  it('기록이 있으면 화면에 남아 서버 메시지를 먼저 보여준다', () => {
    expect(
      getTripDeleteErrorNotice(
        apiError(409, { code: 'TRIP_RECORDS_EXIST', message: '서버 문구' }),
      ),
    ).toEqual({ message: '서버 문구', exitTo: null });
    expect(
      getTripDeleteErrorNotice(apiError(409, { code: 'TRIP_RECORDS_EXIST' })),
    ).toEqual({
      message: '지출 또는 정산 기록이 있어 삭제할 수 없어요.',
      exitTo: null,
    });
  });

  it('그 밖의 실패는 화면에 남아 다시 시도할 수 있다', () => {
    expect(getTripDeleteErrorNotice(networkError)).toEqual({
      message: '여행을 삭제하지 못했어요. 다시 시도해주세요.',
      exitTo: null,
    });
  });
});
