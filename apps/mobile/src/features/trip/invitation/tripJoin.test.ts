import { AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { getTripJoinErrorResult } from '@/features/trip/invitation/tripJoin';

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

describe('getTripJoinErrorResult', () => {
  it('닉네임 중복은 화면에 남아 닉네임을 고치게 한다', () => {
    expect(
      getTripJoinErrorResult(
        apiError(409, { code: 'TRIP_NICKNAME_DUPLICATED' }),
      ),
    ).toEqual({
      message: '중복된 닉네임입니다.',
      shouldLeave: false,
      isNicknameError: true,
    });
  });

  it.each([
    [409, 'TRIP_CAPACITY_FULL'],
    [409, 'TRIP_ALREADY_CONFIRMED'],
    [409, 'UNKNOWN_CONFLICT'],
    [404, 'TRIP_INVITATION_NOT_FOUND'],
  ])('%i %s는 토스트 후 여행 목록으로 돌아간다', (status, code) => {
    expect(getTripJoinErrorResult(apiError(status, { code }))).toEqual({
      message: '참여할 수 없는 여행이에요.',
      shouldLeave: true,
      isNicknameError: false,
    });
  });

  it('그 밖의 오류는 서버 메시지나 기본 문구로 알리고 화면에 남는다', () => {
    expect(
      getTripJoinErrorResult(apiError(500, { message: '서버 오류입니다.' })),
    ).toEqual({
      message: '서버 오류입니다.',
      shouldLeave: false,
      isNicknameError: false,
    });
    expect(getTripJoinErrorResult(new Error('network'))).toEqual({
      message: '여행에 참여하지 못했어요. 다시 시도해주세요.',
      shouldLeave: false,
      isNicknameError: false,
    });
  });
});
