import { clearAppleFullName } from '@/features/auth/services/appleFullNameCache';
import { socialLogin } from '@/features/auth/services/authApi';
import {
  saveAuthTokens,
  setRegistrationToken,
} from '@/features/auth/services/authStorage';
import { loginWithProvider } from '@/features/auth/services/loginWithProvider';
import { saveRecentLoginProvider } from '@/features/auth/services/recentLoginStorage';
import { requestSocialCredential } from '@/features/auth/services/socialSignIn';

jest.mock('@/features/auth/services/appleFullNameCache');
jest.mock('@/features/auth/services/authApi');
jest.mock('@/features/auth/services/authStorage');
jest.mock('@/features/auth/services/recentLoginStorage');
// 네이티브 SDK 모듈이 jest에 없어서 실제 모듈을 불러오지 않고 대체한다
jest.mock('@/features/auth/services/socialSignIn', () => ({
  requestSocialCredential: jest.fn(),
}));

const credential = { provider: 'GOOGLE', idToken: 'id-token' } as const;

describe('loginWithProvider', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(requestSocialCredential).mockResolvedValue(credential);
  });

  it('로그인되면 토큰을 저장하고 AUTHENTICATED를 돌려준다', async () => {
    jest.mocked(socialLogin).mockResolvedValue({
      status: 'AUTHENTICATED',
      accessToken: 'access',
      refreshToken: 'refresh',
    });

    await expect(loginWithProvider('GOOGLE')).resolves.toBe('AUTHENTICATED');

    expect(socialLogin).toHaveBeenCalledWith(credential);
    expect(saveAuthTokens).toHaveBeenCalledWith({
      accessToken: 'access',
      refreshToken: 'refresh',
    });
    expect(setRegistrationToken).toHaveBeenCalledWith(null);
    expect(saveRecentLoginProvider).toHaveBeenCalledWith('GOOGLE');
  });

  it('가입이 필요하면 가입 토큰을 보관하고 토큰은 저장하지 않는다', async () => {
    jest.mocked(socialLogin).mockResolvedValue({
      status: 'REGISTRATION_REQUIRED',
      registrationToken: 'registration',
    });

    await expect(loginWithProvider('KAKAO')).resolves.toBe(
      'REGISTRATION_REQUIRED',
    );

    expect(setRegistrationToken).toHaveBeenCalledWith('registration');
    expect(saveAuthTokens).not.toHaveBeenCalled();
    expect(saveRecentLoginProvider).toHaveBeenCalledWith('KAKAO');
  });

  it('최근 로그인 저장이 실패해도 토큰을 저장하고 AUTHENTICATED를 돌려준다', async () => {
    jest.mocked(socialLogin).mockResolvedValue({
      status: 'AUTHENTICATED',
      accessToken: 'access',
      refreshToken: 'refresh',
    });
    jest
      .mocked(saveRecentLoginProvider)
      .mockRejectedValue(new Error('SecureStore 오류'));

    await expect(loginWithProvider('GOOGLE')).resolves.toBe('AUTHENTICATED');

    expect(saveAuthTokens).toHaveBeenCalledWith({
      accessToken: 'access',
      refreshToken: 'refresh',
    });
  });

  it('애플 로그인이 BE에서 성공하면 보관해 둔 이름을 비운다', async () => {
    jest.mocked(requestSocialCredential).mockResolvedValue({
      provider: 'APPLE',
      idToken: 'id-token',
      authorizationCode: 'code',
      fullName: '홍길동',
    });
    jest.mocked(socialLogin).mockResolvedValue({
      status: 'REGISTRATION_REQUIRED',
      registrationToken: 'registration',
    });

    await loginWithProvider('APPLE');

    expect(clearAppleFullName).toHaveBeenCalled();
  });

  it('애플 로그인이 BE에서 실패하면 재시도를 위해 이름을 남겨 둔다', async () => {
    jest.mocked(socialLogin).mockRejectedValue(new Error('503'));

    await expect(loginWithProvider('APPLE')).rejects.toThrow('503');

    expect(clearAppleFullName).not.toHaveBeenCalled();
  });

  it('BE 요청이 실패하면 에러를 그대로 전달하고 저장하지 않는다', async () => {
    jest.mocked(socialLogin).mockRejectedValue(new Error('401'));

    await expect(loginWithProvider('GOOGLE')).rejects.toThrow('401');

    expect(saveAuthTokens).not.toHaveBeenCalled();
    expect(setRegistrationToken).not.toHaveBeenCalled();
    expect(saveRecentLoginProvider).not.toHaveBeenCalled();
  });
});
