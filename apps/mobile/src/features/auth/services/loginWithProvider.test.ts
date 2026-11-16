import { socialLogin } from '@/features/auth/services/authApi';
import {
  saveAuthTokens,
  setRegistrationToken,
} from '@/features/auth/services/authStorage';
import { loginWithProvider } from '@/features/auth/services/loginWithProvider';
import { saveRecentLoginProvider } from '@/features/auth/services/recentLoginStorage';
import { requestSocialCredential } from '@/features/auth/services/socialSignIn';

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

  it('BE 요청이 실패하면 에러를 그대로 전달하고 저장하지 않는다', async () => {
    jest.mocked(socialLogin).mockRejectedValue(new Error('401'));

    await expect(loginWithProvider('GOOGLE')).rejects.toThrow('401');

    expect(saveAuthTokens).not.toHaveBeenCalled();
    expect(setRegistrationToken).not.toHaveBeenCalled();
    expect(saveRecentLoginProvider).not.toHaveBeenCalled();
  });
});
