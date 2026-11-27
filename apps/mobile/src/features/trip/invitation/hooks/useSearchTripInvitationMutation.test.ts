import { useMutation } from '@tanstack/react-query';

import { useSearchTripInvitationMutation } from '@/features/trip/invitation/hooks/useSearchTripInvitationMutation';
import { searchTripInvitation } from '@/features/trip/services/tripApi';

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
}));

jest.mock('@/features/trip/services/tripApi', () => ({
  searchTripInvitation: jest.fn(),
}));

describe('useSearchTripInvitationMutation', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('초대 코드 검색은 재시도하지 않고 캐시를 갱신하지 않는다', () => {
    useSearchTripInvitationMutation();

    const options = jest.mocked(useMutation).mock.calls[0]?.[0];

    expect(options).toEqual({
      mutationFn: searchTripInvitation,
      retry: false,
    });
  });
});
