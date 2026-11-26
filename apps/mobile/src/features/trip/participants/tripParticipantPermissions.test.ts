import {
  canManageTripParticipants,
  canOpenTrip,
} from './tripParticipantPermissions';

describe('참여자 관리 권한', () => {
  it('확정 전 여행의 관리자만 직접 추가 등 참여자를 관리할 수 있다', () => {
    expect(
      canManageTripParticipants({ myRole: 'ADMIN', status: 'UNCONFIRMED' }),
    ).toBe(true);
    expect(
      canManageTripParticipants({ myRole: 'MEMBER', status: 'UNCONFIRMED' }),
    ).toBe(false);
    expect(
      canManageTripParticipants({ myRole: 'ADMIN', status: 'CONFIRMED' }),
    ).toBe(false);
    expect(
      canManageTripParticipants({ myRole: 'MEMBER', status: 'CONFIRMED' }),
    ).toBe(false);
    expect(canManageTripParticipants(undefined)).toBe(false);
  });
});

describe('여행방 오픈 조건', () => {
  const trip = {
    myRole: 'ADMIN' as const,
    status: 'UNCONFIRMED' as const,
    memberCapacity: 4,
    registeredMemberCount: 4,
  };

  it('확정 전 여행의 관리자는 정원이 찼을 때만 오픈할 수 있다', () => {
    expect(canOpenTrip(trip)).toBe(true);
    expect(canOpenTrip({ ...trip, registeredMemberCount: 3 })).toBe(false);
  });

  it('참여자와 이미 확정된 여행은 오픈할 수 없다', () => {
    expect(canOpenTrip({ ...trip, myRole: 'MEMBER' })).toBe(false);
    expect(canOpenTrip({ ...trip, status: 'CONFIRMED' })).toBe(false);
    expect(canOpenTrip(undefined)).toBe(false);
  });
});
