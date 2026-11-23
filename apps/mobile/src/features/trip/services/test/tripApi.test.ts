import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';

import { apiBaseUrl } from '@/lib/api';
import { parseApiError } from '@/lib/apiError';
import { mobileTokenStorage } from '@/lib/tokenStorage';

import { createTrip, listTrips } from '@/features/trip/services/tripApi';
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
