import { apiClient } from '@/lib/api';

import { createTrip } from '@/features/trip/services/tripApi';
import type { CreateTripRequest } from '@/features/trip/services/tripCreationRequest';

jest.mock('@/lib/api', () => ({ apiClient: { post: jest.fn() } }));

const request: CreateTripRequest = {
  name: '도쿄 여행',
  countryCode: 'JP',
  baseCurrency: 'JPY',
  startDate: '2026-12-01',
  endDate: '2026-12-05',
  memberCapacity: 3,
  nickname: '민서',
};

it('생성 요청에 본문과 Idempotency-Key를 보내고 응답을 반환한다', async () => {
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
  jest.mocked(apiClient.post).mockResolvedValue({ data: { data: trip } });

  await expect(
    createTrip({ request, idempotencyKey: 'test-uuid' }),
  ).resolves.toEqual(trip);
  expect(apiClient.post).toHaveBeenCalledWith('/api/v1/trips', request, {
    headers: { 'Idempotency-Key': 'test-uuid' },
  });
});
