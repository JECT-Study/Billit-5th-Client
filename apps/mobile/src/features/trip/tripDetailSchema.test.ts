import { tripDetailSchema } from '@/features/trip/tripDetailSchema';

const participant = {
  tripMemberId: '10',
  memberId: '100',
  tripNickname: '민지',
  role: 'ADMIN',
  participantStatus: 'MEMBER',
  shareAmountKrw: '0.00',
};

const trip = {
  tripId: '1',
  name: '도쿄 여행',
  countryCode: 'JP',
  customCountryName: null,
  startDate: '2026-11-05',
  endDate: '2026-11-07',
  baseCurrency: 'JPY',
  memberCapacity: 4,
  registeredMemberCount: 3,
  status: 'UNCONFIRMED',
  myRole: 'ADMIN',
  participants: [participant],
};

describe('tripDetailSchema', () => {
  it('여행 상세 응답을 파싱한다', () => {
    expect(tripDetailSchema.parse(trip)).toEqual(trip);
  });

  it.each(['MEMBER', 'GUEST', 'LEFT', 'WITHDRAWN'])(
    '참여자 상태 %s를 받는다',
    (participantStatus) => {
      const result = tripDetailSchema.safeParse({
        ...trip,
        participants: [{ ...participant, participantStatus }],
      });

      expect(result.success).toBe(true);
    },
  );

  it('비로그인 참여자와 탈퇴 회원의 memberId null을 받는다', () => {
    const result = tripDetailSchema.parse({
      ...trip,
      participants: [
        {
          ...participant,
          memberId: null,
          tripNickname: '탈퇴한 사용자 1',
          participantStatus: 'WITHDRAWN',
        },
      ],
    });

    expect(result.participants[0]?.memberId).toBeNull();
  });

  it('참여자 목록이 없으면 거절한다', () => {
    const { participants: _, ...summary } = trip;

    expect(tripDetailSchema.safeParse(summary).success).toBe(false);
  });

  it.each([
    ['알 수 없는 참여자 상태', { participantStatus: 'KICKED' }],
    ['숫자 ID', { tripMemberId: 10 }],
    ['소수점 두 자리가 아닌 금액', { shareAmountKrw: '1000' }],
  ])('%s는 거절한다', (_, override) => {
    const result = tripDetailSchema.safeParse({
      ...trip,
      participants: [{ ...participant, ...override }],
    });

    expect(result.success).toBe(false);
  });
});
