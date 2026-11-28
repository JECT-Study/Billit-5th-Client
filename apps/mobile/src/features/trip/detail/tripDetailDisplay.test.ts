import type { Participant } from '@/features/trip/tripDetailSchema';
import { sortTripParticipants } from '@/features/trip/detail/tripDetailDisplay';

function participant(
  tripMemberId: string,
  overrides: Partial<Participant> = {},
): Participant {
  return {
    tripMemberId,
    memberId: tripMemberId,
    tripNickname: tripMemberId,
    role: 'MEMBER',
    participantStatus: 'MEMBER',
    shareAmountKrw: '0.00',
    ...overrides,
  };
}

function ids(participants: Participant[]) {
  return participants.map(({ tripMemberId }) => tripMemberId);
}

describe('sortTripParticipants', () => {
  it('관리자 → 로그인 → 비로그인 → 나간 회원 → 탈퇴 회원 순으로 둔다', () => {
    const sorted = sortTripParticipants([
      participant('withdrawn', { participantStatus: 'WITHDRAWN' }),
      participant('guest', { participantStatus: 'GUEST' }),
      participant('left', { participantStatus: 'LEFT' }),
      participant('member'),
      participant('admin', { role: 'ADMIN' }),
    ]);

    expect(ids(sorted)).toEqual([
      'admin',
      'member',
      'guest',
      'left',
      'withdrawn',
    ]);
  });

  it('같은 순위끼리는 받은 순서를 유지한다', () => {
    const sorted = sortTripParticipants([
      participant('guest-1', { participantStatus: 'GUEST' }),
      participant('member-1'),
      participant('guest-2', { participantStatus: 'GUEST' }),
      participant('member-2'),
    ]);

    expect(ids(sorted)).toEqual(['member-1', 'member-2', 'guest-1', 'guest-2']);
  });

  it('원래 배열은 바꾸지 않는다', () => {
    const participants = [
      participant('member'),
      participant('admin', { role: 'ADMIN' }),
    ];

    sortTripParticipants(participants);

    expect(ids(participants)).toEqual(['member', 'admin']);
  });
});
