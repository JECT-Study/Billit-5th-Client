import * as SecureStore from 'expo-secure-store';

import { getRecentLoginProvider } from '@/features/auth/services/recentLoginStorage';

jest.mock('expo-secure-store');

describe('getRecentLoginProvider', () => {
  it('저장된 프로바이더를 돌려준다', async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue('KAKAO');
    await expect(getRecentLoginProvider()).resolves.toBe('KAKAO');
  });

  it('저장값이 없거나 프로바이더가 아니면 null이다', async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue(null);
    await expect(getRecentLoginProvider()).resolves.toBeNull();

    jest.mocked(SecureStore.getItemAsync).mockResolvedValue('google');
    await expect(getRecentLoginProvider()).resolves.toBeNull();
  });
});
