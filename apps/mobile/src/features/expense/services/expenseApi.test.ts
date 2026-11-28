import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';

import { createExpense, type ExpenseRequest } from './expenseApi';
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

it('지출 생성 요청에 동일한 멱등성 키와 입력을 전달한다', async () => {
  const input: ExpenseRequest = {
    name: '식사',
    splitType: 'EQUAL',
    currency: 'KRW',
    paidDate: '2026-11-05',
    paymentMethod: 'CARD',
    payerTripMemberId: '201',
    originalAmount: '12000.00',
    discountAmount: '0.00',
    exchangeRate: '1.00',
    exchangeRateSource: 'MANUAL',
    tripMemberIds: ['201', '202'],
  };
  const key = '8b2e4c1a-3f5d-4a6b-9c7e-1d2f3a4b5c6d';
  server.use(
    http.post(
      `${apiBaseUrl}/api/v1/trips/123/expenses`,
      async ({ request }) => {
        expect(request.headers.get('Idempotency-Key')).toBe(key);
        expect(await request.json()).toEqual(input);
        return HttpResponse.json(
          { data: { expenseId: '501' } },
          { status: 201 },
        );
      },
    ),
  );
  await expect(createExpense('123', input, key)).resolves.toEqual({
    expenseId: '501',
  });
  await expect(createExpense('123', input, key)).resolves.toEqual({
    expenseId: '501',
  });
});
