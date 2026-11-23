import {
  formatTripMemberLimit,
  getInviteCodeSearchStatus,
} from '@/features/trip/inviteCodeSearchResult';

const joinable = {
  isAlreadyJoined: false,
  status: 'UNCONFIRMED' as const,
  registeredMemberCount: 2,
  memberCapacity: 6,
};

describe('getInviteCodeSearchStatus', () => {
  it('확정 전이고 빈자리가 있으면 참여할 수 있다', () => {
    expect(getInviteCodeSearchStatus(joinable)).toBe('JOINABLE');
  });

  it('확정된 여행은 참여할 수 없다', () => {
    expect(
      getInviteCodeSearchStatus({ ...joinable, status: 'CONFIRMED' }),
    ).toBe('UNAVAILABLE');
  });

  it('등록 인원이 정원 이상이면 참여할 수 없다', () => {
    expect(
      getInviteCodeSearchStatus({ ...joinable, registeredMemberCount: 6 }),
    ).toBe('UNAVAILABLE');
    expect(
      getInviteCodeSearchStatus({ ...joinable, registeredMemberCount: 7 }),
    ).toBe('UNAVAILABLE');
  });

  it('이미 참여한 여행은 확정되거나 정원이 찼어도 이미 참여로 본다', () => {
    expect(
      getInviteCodeSearchStatus({ ...joinable, isAlreadyJoined: true }),
    ).toBe('ALREADY_JOINED');
    expect(
      getInviteCodeSearchStatus({
        isAlreadyJoined: true,
        status: 'CONFIRMED',
        registeredMemberCount: 6,
        memberCapacity: 6,
      }),
    ).toBe('ALREADY_JOINED');
  });
});

describe('formatTripMemberLimit', () => {
  it('등록 인원/정원 형식으로 보여준다', () => {
    expect(formatTripMemberLimit(joinable)).toBe('참여 제한 2/6');
  });
});
