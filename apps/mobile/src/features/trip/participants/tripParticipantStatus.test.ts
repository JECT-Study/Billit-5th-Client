import { AxiosError, type InternalAxiosRequestConfig } from 'axios';

import {
  getParticipantAccessNotice,
  shouldCloseParticipantSheet,
} from './tripParticipantStatus';

function apiError(status: number) {
  const config = { headers: {} } as InternalAxiosRequestConfig;
  return new AxiosError('error', undefined, config, undefined, {
    config,
    data: {},
    headers: {},
    status,
    statusText: '',
  });
}

describe('참여 현황 화면 상태', () => {
  it('접근 권한이 없거나 여행이 삭제되면 각각 안내한다', () => {
    expect(getParticipantAccessNotice(apiError(403))).toBe(
      '이 여행방에 접근할 수 없어요.',
    );
    expect(getParticipantAccessNotice(apiError(404))).toBe(
      '삭제된 여행이에요.',
    );
    expect(getParticipantAccessNotice(apiError(500))).toBeNull();
    expect(getParticipantAccessNotice(new Error('network'))).toBeNull();
  });

  it('일반 참여자의 여행방이 오픈되면 시트를 닫는다', () => {
    expect(
      shouldCloseParticipantSheet(
        { myRole: 'MEMBER', status: 'CONFIRMED' },
        null,
      ),
    ).toBe(true);
    expect(
      shouldCloseParticipantSheet(
        { myRole: 'MEMBER', status: 'UNCONFIRMED' },
        null,
      ),
    ).toBe(false);
    expect(
      shouldCloseParticipantSheet(
        { myRole: 'ADMIN', status: 'CONFIRMED' },
        null,
      ),
    ).toBe(false);
  });

  it('오래된 확정 정보보다 접근 불가 안내를 우선한다', () => {
    expect(
      shouldCloseParticipantSheet(
        { myRole: 'MEMBER', status: 'CONFIRMED' },
        apiError(403),
      ),
    ).toBe(false);
  });
});
