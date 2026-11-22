import { apiClient } from '@/lib/api';

import { listTrips } from '@/features/trip/services/tripListApi';

jest.mock('@/lib/api', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

const tripListResponse = {
  data: [
    {
      tripId: '123',
      name: '도쿄 여행',
      countryCode: 'JP',
      customCountryName: null,
      startDate: '2026-11-05',
      endDate: '2026-11-07',
      memberCapacity: 3,
      registeredMemberCount: 3,
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

describe('trip list api', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('기본 페이지와 크기로 전체 여행 목록을 조회한다', async () => {
    jest.mocked(apiClient.get).mockResolvedValue({ data: tripListResponse });

    await expect(listTrips()).resolves.toEqual(tripListResponse);

    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/trips', {
      params: { page: 0, size: 20 },
    });
  });

  it('필터와 페이지 정보를 포함해 여행 목록을 조회한다', async () => {
    jest.mocked(apiClient.get).mockResolvedValue({ data: tripListResponse });

    await listTrips({ page: 1, size: 10, filter: 'UPCOMING' });

    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/trips', {
      params: { page: 1, size: 10, filter: 'UPCOMING' },
    });
  });

  it('명세와 다른 응답은 반환하지 않는다', async () => {
    jest.mocked(apiClient.get).mockResolvedValue({
      data: {
        ...tripListResponse,
        page: { ...tripListResponse.page, hasNext: 'false' },
      },
    });

    await expect(listTrips()).rejects.toThrow();
  });
});
