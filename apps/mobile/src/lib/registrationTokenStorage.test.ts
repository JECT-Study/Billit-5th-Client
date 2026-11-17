import { registrationTokenStorage } from '@/lib/registrationTokenStorage';

const ISSUED_AT = 1_700_000_000_000;
const TWENTY_NINE_MINUTES_MS = 29 * 60 * 1000;

describe('registrationTokenStorage', () => {
  beforeEach(async () => {
    jest.restoreAllMocks();
    await registrationTokenStorage.setToken(null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('저장한 토큰을 돌려준다', async () => {
    const saving = registrationTokenStorage.setToken('registration-token');

    await expect(registrationTokenStorage.getToken()).resolves.toBe(
      'registration-token',
    );
    await saving;
  });

  it('29분이 되기 직전에는 토큰이 유효하다', async () => {
    const now = jest.spyOn(Date, 'now').mockReturnValue(ISSUED_AT);
    await registrationTokenStorage.setToken('registration-token');

    now.mockReturnValue(ISSUED_AT + TWENTY_NINE_MINUTES_MS - 1);

    await expect(registrationTokenStorage.getToken()).resolves.toBe(
      'registration-token',
    );
  });

  it('29분이 지나면 null을 반환하고 토큰과 발급 시각을 비운다', async () => {
    const now = jest.spyOn(Date, 'now').mockReturnValue(ISSUED_AT);
    await registrationTokenStorage.setToken('registration-token');

    now.mockReturnValue(ISSUED_AT + TWENTY_NINE_MINUTES_MS);
    await expect(registrationTokenStorage.getToken()).resolves.toBeNull();

    now.mockReturnValue(ISSUED_AT + 1_000);
    await expect(registrationTokenStorage.getToken()).resolves.toBeNull();
  });

  it('setToken(null)은 토큰과 발급 시각을 지운다', async () => {
    const now = jest.spyOn(Date, 'now').mockReturnValue(ISSUED_AT);
    await registrationTokenStorage.setToken('registration-token');
    await registrationTokenStorage.setToken(null);

    now.mockReturnValue(ISSUED_AT + 1_000);
    await expect(registrationTokenStorage.getToken()).resolves.toBeNull();
  });
});
