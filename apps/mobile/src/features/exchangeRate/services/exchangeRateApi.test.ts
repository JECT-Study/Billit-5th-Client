import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';

import {
  getReferenceExchangeRate,
  registerManualExchangeRate,
} from './exchangeRateApi';
import { apiBaseUrl } from '@/lib/api';
import { mobileTokenStorage } from '@/lib/tokenStorage';

jest.mock('@/lib/tokenStorage', () => ({
  mobileTokenStorage: { getToken: jest.fn(), setToken: jest.fn() },
}));
const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
beforeEach(() =>
  jest.mocked(mobileTokenStorage.getToken).mockResolvedValue('member-token'),
);

it('결제 통화와 날짜로 참고 환율을 조회한다', async () => {
  server.use(
    http.get(`${apiBaseUrl}/api/v1/reference-exchange-rates`, ({ request }) => {
      const url = new URL(request.url);
      expect(url.searchParams.get('currency')).toBe('JPY');
      expect(url.searchParams.get('paidDate')).toBe('2026-11-05');
      expect(request.headers.get('Authorization')).toBe('Bearer member-token');
      return HttpResponse.json({
        data: {
          currency: 'JPY',
          rate: '9.12',
          provider: 'ECB',
          baseDate: '2026-11-04',
        },
      });
    }),
  );
  await expect(
    getReferenceExchangeRate('JPY', '2026-11-05'),
  ).resolves.toMatchObject({
    rate: '9.12',
    baseDate: '2026-11-04',
  });
});

it('환전 날짜와 수단을 포함해 개인 환율을 등록한다', async () => {
  const input = {
    currency: 'JPY',
    rate: '9.12',
    exchangeMethod: 'CASH',
    exchangeDate: '2026-11-05',
  } as const;
  server.use(
    http.post(
      `${apiBaseUrl}/api/v1/trips/123/exchange-rates`,
      async ({ request }) => {
        expect(await request.json()).toEqual(input);
        return HttpResponse.json(
          { data: { exchangeRateId: '5', rate: '9.12' } },
          { status: 201 },
        );
      },
    ),
  );
  await expect(registerManualExchangeRate('123', input)).resolves.toEqual({
    exchangeRateId: '5',
    rate: '9.12',
  });
});
