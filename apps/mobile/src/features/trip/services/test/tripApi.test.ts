import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';

import { apiBaseUrl } from '@/lib/api';
import { parseApiError } from '@/lib/apiError';
import { mobileTokenStorage } from '@/lib/tokenStorage';

import {
  createTrip,
  getTripInvitation,
  joinTripByInviteCode,
  listTrips,
  searchTripInvitation,
} from '@/features/trip/services/tripApi';
import type { CreateTripRequest } from '@/features/trip/services/tripCreationRequest';

jest.mock('@/lib/tokenStorage', () => ({
  mobileTokenStorage: {
    getToken: jest.fn(),
    setToken: jest.fn(),
  },
}));

const server = setupServer();
const createTripUrl = `${apiBaseUrl}/api/v1/trips`;
const tripListUrl = `${apiBaseUrl}/api/v1/trips`;

const request: CreateTripRequest = {
  name: '도쿄 여행',
  countryCode: 'JP',
  baseCurrency: 'JPY',
  startDate: '2026-12-01',
  endDate: '2026-12-05',
  memberCapacity: 3,
  nickname: '민서',
};

const trip = {
  tripId: 'trip-1',
  name: '도쿄 여행',
  countryCode: 'JP',
  customCountryName: null,
  startDate: '2026-12-01',
  endDate: '2026-12-05',
  baseCurrency: 'JPY',
  memberCapacity: 3,
  registeredMemberCount: 1,
  status: 'UNCONFIRMED',
  myRole: 'ADMIN',
};

const tripListResponse = {
  data: [
    {
      tripId: 'trip-1',
      name: '도쿄 여행',
      countryCode: 'JP',
      customCountryName: null,
      startDate: '2026-12-01',
      endDate: '2026-12-05',
      memberCapacity: 3,
      registeredMemberCount: 1,
      status: 'UNCONFIRMED',
      myRole: 'ADMIN',
      myShareAmountKrw: '0.00',
    },
  ],
  page: {
    page: 0,
    size: 20,
    totalElements: 1,
    hasNext: false,
  },
};

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  jest.mocked(mobileTokenStorage.getToken).mockResolvedValue('member-token');
});

it('요청 본문과 인증·멱등성 헤더를 보내고 201 응답을 파싱한다', async () => {
  let receivedBody: unknown;
  let receivedAuthorization: string | null = null;
  let receivedIdempotencyKey: string | null = null;

  server.use(
    http.post(createTripUrl, async ({ request: incoming }) => {
      receivedBody = await incoming.json();
      receivedAuthorization = incoming.headers.get('Authorization');
      receivedIdempotencyKey = incoming.headers.get('Idempotency-Key');
      return HttpResponse.json({ data: trip }, { status: 201 });
    }),
  );

  await expect(
    createTrip({ request, idempotencyKey: 'test-uuid' }),
  ).resolves.toEqual(trip);
  expect(receivedBody).toEqual(request);
  expect(receivedAuthorization).toBe('Bearer member-token');
  expect(receivedIdempotencyKey).toBe('test-uuid');
});

it('서버의 멱등성 키 충돌 오류를 호출자에게 전달한다', async () => {
  server.use(
    http.post(createTripUrl, () =>
      HttpResponse.json(
        {
          code: 'TRIP_IDEMPOTENCY_KEY_REUSED',
          message: '이미 사용한 요청 키입니다.',
        },
        { status: 409 },
      ),
    ),
  );

  try {
    await createTrip({ request, idempotencyKey: 'reused-uuid' });
    throw new Error('409 응답이 실패로 전달되어야 합니다.');
  } catch (error) {
    expect(parseApiError(error)).toMatchObject({
      status: 409,
      code: 'TRIP_IDEMPOTENCY_KEY_REUSED',
    });
  }
});

describe('trip list api', () => {
  it('기본 페이지와 크기로 전체 여행 목록을 조회한다', async () => {
    let receivedUrl: URL | undefined;

    server.use(
      http.get(tripListUrl, ({ request: incoming }) => {
        receivedUrl = new URL(incoming.url);
        return HttpResponse.json(tripListResponse);
      }),
    );

    await expect(listTrips()).resolves.toEqual(tripListResponse);

    expect(receivedUrl?.searchParams.get('page')).toBe('0');
    expect(receivedUrl?.searchParams.get('size')).toBe('20');
    expect(receivedUrl?.searchParams.has('filter')).toBe(false);
  });

  it('필터와 페이지 정보를 포함해 여행 목록을 조회한다', async () => {
    let receivedUrl: URL | undefined;

    server.use(
      http.get(tripListUrl, ({ request: incoming }) => {
        receivedUrl = new URL(incoming.url);
        return HttpResponse.json(tripListResponse);
      }),
    );

    await listTrips({ page: 1, size: 10, filter: 'UPCOMING' });

    expect(receivedUrl?.searchParams.get('page')).toBe('1');
    expect(receivedUrl?.searchParams.get('size')).toBe('10');
    expect(receivedUrl?.searchParams.get('filter')).toBe('UPCOMING');
  });

  it('명세와 다른 응답은 반환하지 않는다', async () => {
    server.use(
      http.get(tripListUrl, () =>
        HttpResponse.json({
          ...tripListResponse,
          page: { ...tripListResponse.page, hasNext: 'false' },
        }),
      ),
    );

    await expect(listTrips()).rejects.toThrow();
  });
});

async function expectApiError(
  request: Promise<unknown>,
  expected: { status: number; code: string },
) {
  try {
    await request;
    throw new Error(`${expected.status} 응답이 실패로 전달되어야 합니다.`);
  } catch (error) {
    expect(parseApiError(error)).toMatchObject(expected);
  }
}

function errorResponse(status: number, code: string) {
  return HttpResponse.json({ code, message: '오류 메시지' }, { status });
}

describe('trip invitation api', () => {
  const invitationUrl = `${apiBaseUrl}/api/v1/trips/trip-1/invitation`;
  const searchUrl = `${apiBaseUrl}/api/v1/trip-invitations`;
  const membershipUrl = `${apiBaseUrl}/api/v1/trip-memberships`;

  const invitation = {
    inviteCode: 'A7K2PQ',
    inviteUrl: 'https://example.com/invitations/A7K2PQ',
  };

  const searchResult = {
    tripId: 'trip-1',
    name: '도쿄 여행',
    startDate: '2026-11-05',
    endDate: '2026-11-07',
    registeredMemberCount: 2,
    memberCapacity: 3,
    status: 'UNCONFIRMED',
    isAlreadyJoined: false,
  };

  const membership = { tripId: 'trip-1', tripMemberId: 'member-2' };

  describe('getTripInvitation', () => {
    it('여행방의 초대 코드와 링크를 조회한다', async () => {
      let receivedAuthorization: string | null = null;

      server.use(
        http.get(invitationUrl, ({ request: incoming }) => {
          receivedAuthorization = incoming.headers.get('Authorization');
          return HttpResponse.json({ data: invitation });
        }),
      );

      await expect(getTripInvitation('trip-1')).resolves.toEqual(invitation);
      expect(receivedAuthorization).toBe('Bearer member-token');
    });

    it('관리자가 아니면 403 오류를 전달한다', async () => {
      server.use(
        http.get(invitationUrl, () => errorResponse(403, 'COMMON_FORBIDDEN')),
      );

      await expectApiError(getTripInvitation('trip-1'), {
        status: 403,
        code: 'COMMON_FORBIDDEN',
      });
    });

    it('확정된 여행이면 409 오류를 전달한다', async () => {
      server.use(
        http.get(invitationUrl, () =>
          errorResponse(409, 'TRIP_ALREADY_CONFIRMED'),
        ),
      );

      await expectApiError(getTripInvitation('trip-1'), {
        status: 409,
        code: 'TRIP_ALREADY_CONFIRMED',
      });
    });
  });

  describe('searchTripInvitation', () => {
    it('초대 코드를 쿼리로 보내 참여 전 정보를 조회한다', async () => {
      let receivedUrl: URL | undefined;

      server.use(
        http.get(searchUrl, ({ request: incoming }) => {
          receivedUrl = new URL(incoming.url);
          return HttpResponse.json({ data: searchResult });
        }),
      );

      await expect(searchTripInvitation('A7K2PQ')).resolves.toEqual(
        searchResult,
      );
      expect(receivedUrl?.searchParams.get('code')).toBe('A7K2PQ');
    });

    it('해당 코드의 여행이 없으면 404 오류를 전달한다', async () => {
      server.use(
        http.get(searchUrl, () =>
          errorResponse(404, 'TRIP_INVITATION_NOT_FOUND'),
        ),
      );

      await expectApiError(searchTripInvitation('ZZZZZZ'), {
        status: 404,
        code: 'TRIP_INVITATION_NOT_FOUND',
      });
    });

    it('명세와 다른 응답은 반환하지 않는다', async () => {
      server.use(
        http.get(searchUrl, () =>
          HttpResponse.json({
            data: { ...searchResult, isAlreadyJoined: 'false' },
          }),
        ),
      );

      await expect(searchTripInvitation('A7K2PQ')).rejects.toThrow();
    });
  });

  describe('joinTripByInviteCode', () => {
    it('초대 코드와 닉네임을 보내고 201 응답을 파싱한다', async () => {
      let receivedBody: unknown;

      server.use(
        http.post(membershipUrl, async ({ request: incoming }) => {
          receivedBody = await incoming.json();
          return HttpResponse.json({ data: membership }, { status: 201 });
        }),
      );

      await expect(
        joinTripByInviteCode({ inviteCode: 'A7K2PQ', nickname: '지훈' }),
      ).resolves.toEqual(membership);
      expect(receivedBody).toEqual({ inviteCode: 'A7K2PQ', nickname: '지훈' });
    });

    it('이미 참여 중이면 200으로 받은 기존 참여 정보를 반환한다', async () => {
      server.use(
        http.post(membershipUrl, () =>
          HttpResponse.json({ data: membership }, { status: 200 }),
        ),
      );

      await expect(
        joinTripByInviteCode({ inviteCode: 'A7K2PQ', nickname: '지훈' }),
      ).resolves.toEqual(membership);
    });

    it('해당 코드의 여행이 없으면 404 오류를 전달한다', async () => {
      server.use(
        http.post(membershipUrl, () =>
          errorResponse(404, 'TRIP_INVITATION_NOT_FOUND'),
        ),
      );

      await expectApiError(
        joinTripByInviteCode({ inviteCode: 'ZZZZZZ', nickname: '지훈' }),
        { status: 404, code: 'TRIP_INVITATION_NOT_FOUND' },
      );
    });

    it.each([
      'TRIP_NICKNAME_DUPLICATED',
      'TRIP_CAPACITY_FULL',
      'TRIP_ALREADY_CONFIRMED',
    ])('409 %s 오류를 전달한다', async (code) => {
      server.use(http.post(membershipUrl, () => errorResponse(409, code)));

      await expectApiError(
        joinTripByInviteCode({ inviteCode: 'A7K2PQ', nickname: '지훈' }),
        { status: 409, code },
      );
    });
  });
});
