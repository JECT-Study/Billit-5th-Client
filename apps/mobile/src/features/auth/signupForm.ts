import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { z } from 'zod';

import {
  MAX_APP_VERSION_LENGTH,
  MAX_NICKNAME_LENGTH,
  NICKNAME_PATTERN,
} from '@/features/auth/constants';
import type { RegistrationTerms } from '@/features/auth/registrationInfoSchema';
import type { CompleteRegistrationRequest } from '@/features/auth/types';

const nicknameSchema = z
  .string()
  .trim()
  .refine(
    (nickname) =>
      nickname.length === 0 ||
      (nickname.length <= MAX_NICKNAME_LENGTH &&
        NICKNAME_PATTERN.test(nickname)),
    '닉네임은 한글, 영문, 숫자만 10자까지 사용할 수 있어요.',
  );

export function createSignupFormSchema(requiredTermsIds: readonly string[]) {
  return z.object({
    nickname: nicknameSchema,
    isAgeEligible: z.literal(true, '만 18세 이상인지 확인해주세요.'),
    agreements: z
      .record(z.string(), z.boolean())
      .refine(
        (agreements) =>
          requiredTermsIds.every((termsId) => agreements[termsId] === true),
        '필수 약관에 동의해주세요.',
      ),
  });
}

export type SignupFormValues = z.infer<
  ReturnType<typeof createSignupFormSchema>
>;

function toRegistrationPlatform(
  os: typeof Platform.OS,
): CompleteRegistrationRequest['platform'] {
  if (os === 'ios') {
    return 'IOS';
  }
  if (os === 'android') {
    return 'ANDROID';
  }
  throw new Error('가입은 iOS와 Android에서만 진행할 수 있어요.');
}

function readAppVersion() {
  const appVersion = Constants.expoConfig?.version;
  if (!appVersion || appVersion.length > MAX_APP_VERSION_LENGTH) {
    throw new Error('앱 버전을 확인할 수 없어요.');
  }
  return appVersion;
}

export function toCompleteRegistrationRequest(
  form: SignupFormValues,
  terms: readonly RegistrationTerms[],
): CompleteRegistrationRequest {
  const platform = toRegistrationPlatform(Platform.OS);
  const appVersion = readAppVersion();
  const nickname = form.nickname.trim();
  const request: CompleteRegistrationRequest = {
    platform,
    appVersion,
    isAgeEligible: true,
    agreements: terms.map((term) => ({
      termsId: term.termsId,
      isAgreed: form.agreements[term.termsId] === true,
    })),
  };

  if (nickname.length > 0) {
    request.nickname = nickname;
  }

  return request;
}
