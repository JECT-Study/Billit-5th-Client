import { Platform } from 'react-native';

import type { RegistrationTerms } from '@/features/auth/registrationInfoSchema';
import {
  createSignupFormSchema,
  toCompleteRegistrationRequest,
  type SignupFormValues,
} from '@/features/auth/signupForm';

const mockExpoConfig: { current: { version: string } | null } = {
  current: { version: '1.0.0' },
};

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    get expoConfig() {
      return mockExpoConfig.current;
    },
  },
}));

const requiredTermsId = 'required-terms';
const schema = createSignupFormSchema([requiredTermsId]);

const terms: RegistrationTerms[] = [
  {
    termsId: requiredTermsId,
    title: '개인정보 수집 및 이용 동의',
    isRequired: true,
    contentUrl: 'https://example.com/terms/privacy',
  },
  {
    termsId: 'optional-terms',
    title: '마케팅 정보 수신 동의',
    isRequired: false,
    contentUrl: 'https://example.com/terms/marketing',
  },
];

function setPlatform(os: typeof Platform.OS) {
  Object.defineProperty(Platform, 'OS', {
    configurable: true,
    get: () => os,
  });
}

function setAppVersion(version: string | null) {
  mockExpoConfig.current = version === null ? null : { version };
}

function signupForm(
  overrides: Partial<SignupFormValues> = {},
): SignupFormValues {
  return {
    nickname: '김빌릿',
    isAgeEligible: true,
    agreements: {
      [requiredTermsId]: true,
      'optional-terms': false,
    },
    ...overrides,
  };
}

describe('createSignupFormSchema', () => {
  function parseNickname(nickname: string) {
    return schema.safeParse(signupForm({ nickname }));
  }

  it('닉네임이 비어 있으면 통과한다', () => {
    expect(parseNickname('').success).toBe(true);
  });

  it('닉네임 1자는 통과한다', () => {
    expect(parseNickname('가').success).toBe(true);
  });

  it('닉네임 10자는 통과한다', () => {
    expect(parseNickname('가'.repeat(10)).success).toBe(true);
  });

  it('닉네임 11자는 통과하지 않는다', () => {
    expect(parseNickname('가'.repeat(11)).success).toBe(false);
  });

  it('닉네임 특수문자는 통과하지 않는다', () => {
    expect(parseNickname('김빌릿!').success).toBe(false);
  });

  it('공백만 있는 닉네임은 trim 후 통과한다', () => {
    const result = parseNickname('   ');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nickname).toBe('');
    }
  });

  it('필수 약관에 동의하지 않으면 통과하지 않는다', () => {
    const result = schema.safeParse(
      signupForm({
        agreements: { [requiredTermsId]: false },
      }),
    );

    expect(result.success).toBe(false);
  });

  it('만 18세를 확인하지 않으면 통과하지 않는다', () => {
    const result = schema.safeParse({
      ...signupForm(),
      isAgeEligible: false,
    });

    expect(result.success).toBe(false);
  });
});

describe('toCompleteRegistrationRequest', () => {
  beforeEach(() => {
    setPlatform('ios');
    setAppVersion('1.0.0');
  });

  it('빈 닉네임은 키를 생략하고 선택 약관은 미동의로 보내며 survey는 넣지 않는다', () => {
    const request = toCompleteRegistrationRequest(
      signupForm({ nickname: '' }),
      terms,
    );

    expect(request).not.toHaveProperty('nickname');
    expect(request).not.toHaveProperty('survey');
    expect(request.platform).toBe('IOS');
    expect(request.appVersion).toBe('1.0.0');
    expect(request.isAgeEligible).toBe(true);
    expect(request.agreements).toEqual([
      { termsId: requiredTermsId, isAgreed: true },
      { termsId: 'optional-terms', isAgreed: false },
    ]);
  });

  it('ios와 android를 IOS와 ANDROID로 보낸다', () => {
    setPlatform('ios');
    expect(toCompleteRegistrationRequest(signupForm(), terms).platform).toBe(
      'IOS',
    );

    setPlatform('android');
    expect(toCompleteRegistrationRequest(signupForm(), terms).platform).toBe(
      'ANDROID',
    );
  });

  it('web이면 요청을 만들지 않고 에러를 던진다', () => {
    setPlatform('web');

    expect(() => toCompleteRegistrationRequest(signupForm(), terms)).toThrow(
      '가입은 iOS와 Android에서만 진행할 수 있어요.',
    );
  });

  it('앱 버전이 없거나 20자를 넘으면 요청을 만들지 않고 에러를 던진다', () => {
    setAppVersion(null);
    expect(() => toCompleteRegistrationRequest(signupForm(), terms)).toThrow(
      '앱 버전을 확인할 수 없어요.',
    );

    setAppVersion('1'.repeat(20));
    expect(toCompleteRegistrationRequest(signupForm(), terms).appVersion).toBe(
      '1'.repeat(20),
    );

    setAppVersion('1'.repeat(21));
    expect(() => toCompleteRegistrationRequest(signupForm(), terms)).toThrow(
      '앱 버전을 확인할 수 없어요.',
    );
  });
});
