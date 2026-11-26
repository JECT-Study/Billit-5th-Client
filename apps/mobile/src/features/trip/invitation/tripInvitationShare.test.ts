import { AxiosError, type InternalAxiosRequestConfig } from 'axios';

import {
  canShareInvitation,
  formatInvitationShareMessage,
} from '@/features/trip/invitation/tripInvitationShare';

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

describe('canShareInvitation', () => {
  it('오류가 없으면 공유할 수 있다', () => {
    expect(canShareInvitation(null)).toBe(true);
  });

  it('권한이 없거나(403) 확정된 여행(409)이면 공유할 수 없다', () => {
    expect(canShareInvitation(apiError(403))).toBe(false);
    expect(canShareInvitation(apiError(409))).toBe(false);
  });

  it('다시 시도하면 될 수 있는 오류는 공유 버튼을 남긴다', () => {
    expect(canShareInvitation(apiError(500))).toBe(true);
    expect(canShareInvitation(apiError(404))).toBe(true);
    expect(canShareInvitation(new Error('network'))).toBe(true);
  });
});

describe('formatInvitationShareMessage', () => {
  it('초대 코드와 링크를 두 줄로 만든다', () => {
    expect(
      formatInvitationShareMessage({
        inviteCode: 'A7K2PQ',
        inviteUrl: 'https://example.com/invitations/A7K2PQ',
      }),
    ).toBe('Billit 초대 코드: A7K2PQ\nhttps://example.com/invitations/A7K2PQ');
  });
});
