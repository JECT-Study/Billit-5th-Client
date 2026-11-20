import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, BackHandler, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { parseApiError } from '@/lib/apiError';
import { Button } from '@/shared/ui/Button';
import { NavigationHeader } from '@/shared/ui/NavigationHeader';
import { Toast } from '@/shared/ui/Toast';

import { SignupAgreementList } from '@/features/auth/components/SignupAgreementList';
import { useCompleteRegistrationMutation } from '@/features/auth/hooks/useCompleteRegistrationMutation';
import { useRegistrationQuery } from '@/features/auth/hooks/useRegistrationQuery';
import type { RegistrationTerms } from '@/features/auth/registrationInfoSchema';
import { RegistrationTokenExpiredError } from '@/features/auth/registrationTokenExpiredError';
import { getRegistrationToken } from '@/features/auth/services/authStorage';
import { clearRegistrationSession } from '@/features/auth/services/clearRegistrationSession';
import {
  isTermsContentUrl,
  openTermsContent,
} from '@/features/auth/services/openTermsContent';
import {
  createSignupFormSchema,
  toCompleteRegistrationRequest,
} from '@/features/auth/signupForm';

type SignupDraft = {
  isAgeEligible: boolean;
  agreements: Record<string, boolean>;
};

const initialSignupDraft: SignupDraft = {
  isAgeEligible: false,
  agreements: {},
};

export function SignupScreen() {
  const registrationQuery = useRegistrationQuery();
  const completeRegistrationMutation = useCompleteRegistrationMutation();
  const isRegistrationPending = completeRegistrationMutation.isPending;
  const [form, setForm] = useState<SignupDraft>(initialSignupDraft);
  const [isRegistrationTokenValid, setIsRegistrationTokenValid] = useState<
    boolean | null
  >(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const isSubmittingRef = useRef(false);
  const requiredTerms =
    registrationQuery.data?.terms.filter((term) => term.isRequired) ?? [];
  const isRequiredAgreementComplete =
    registrationQuery.data !== undefined &&
    form.isAgeEligible &&
    requiredTerms.every((term) => form.agreements[term.termsId] === true);

  const handlePressBack = useCallback(() => {
    // 요청이 끝난 뒤 성공 이동이 로그인 화면 위에서 /onboarding으로 이어지지 않게 막는다.
    if (isRegistrationPending || isSubmittingRef.current) {
      return;
    }
    clearRegistrationSession();
    router.replace('/login');
  }, [isRegistrationPending]);

  useEffect(() => {
    let isCurrent = true;
    getRegistrationToken()
      .then((token) => {
        if (!token) {
          clearRegistrationSession();
          if (isCurrent) {
            setIsRegistrationTokenValid(false);
            router.replace('/login');
          }
          return;
        }
        if (isCurrent) {
          setIsRegistrationTokenValid(true);
        }
      })
      .catch(() => {
        if (isCurrent) {
          clearRegistrationSession();
          setIsRegistrationTokenValid(false);
          router.replace('/login');
        }
      });
    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        handlePressBack();
        return true;
      },
    );
    return () => subscription.remove();
  }, [handlePressBack]);

  function showToast(message: string) {
    setToastMessage(message);
  }

  function handleDismissToast() {
    setToastMessage(null);
  }

  function handleToggleAgeEligible() {
    setForm((current) => ({
      ...current,
      isAgeEligible: !current.isAgeEligible,
    }));
  }

  function handleToggleTerms(termsId: string) {
    setForm((current) => ({
      ...current,
      agreements: {
        ...current.agreements,
        [termsId]: current.agreements[termsId] !== true,
      },
    }));
  }

  async function handlePressTermsDetail(terms: RegistrationTerms) {
    // 약관 주소는 서버(contentUrl)가 준다. Notion 게시 주소가 등록되면 앱 수정 없이 열린다.
    if (!isTermsContentUrl(terms.contentUrl)) {
      showToast('약관 내용을 준비하고 있어요.');
      return;
    }
    try {
      await openTermsContent(terms.contentUrl);
    } catch {
      showToast('약관을 열지 못했어요. 잠시 후 다시 시도해주세요.');
    }
  }

  function showExpiredAndLeave() {
    clearRegistrationSession();
    Alert.alert('가입 시간이 만료됐어요', undefined, [
      {
        text: '확인',
        onPress: () => {
          router.replace('/login');
        },
      },
    ]);
  }

  async function handlePressCompleteSignup() {
    if (isSubmittingRef.current) {
      return;
    }
    isSubmittingRef.current = true;
    try {
      const token = await getRegistrationToken();
      if (!token) {
        showExpiredAndLeave();
        return;
      }

      const terms = registrationQuery.data?.terms;
      if (!terms) {
        if (parseApiError(registrationQuery.error)?.status === 401) {
          showExpiredAndLeave();
          return;
        }
        if (!registrationQuery.isError) {
          return;
        }
        showToast('약관을 불러오지 못했어요. 다시 시도해주세요.');
        const refreshed = await registrationQuery.refetch();
        if (parseApiError(refreshed.error)?.status === 401) {
          showExpiredAndLeave();
        }
        return;
      }

      const requiredTermsIds = terms
        .filter((term) => term.isRequired)
        .map((term) => term.termsId);
      const parsed = createSignupFormSchema(requiredTermsIds).safeParse(form);
      if (!parsed.success) {
        const field = parsed.error.issues[0]?.path[0];
        if (field === 'agreements') {
          showToast('필수 약관에 동의해주세요.');
          return;
        }
        if (field === 'isAgeEligible') {
          showToast('만 18세 이상인지 확인해주세요.');
          return;
        }
        showToast(parsed.error.issues[0]?.message ?? '입력값을 확인해주세요.');
        return;
      }

      const request = toCompleteRegistrationRequest(parsed.data, terms);
      await completeRegistrationMutation.mutateAsync(request);
      router.replace('/onboarding');
    } catch (error) {
      if (error instanceof RegistrationTokenExpiredError) {
        showExpiredAndLeave();
        return;
      }

      const apiError = parseApiError(error);
      if (apiError?.status === 401) {
        showExpiredAndLeave();
        return;
      }
      if (
        apiError?.status === 400 &&
        apiError.code === 'USER_REQUIRED_AGREEMENT_MISSING'
      ) {
        showToast(apiError.message ?? '필수 약관에 동의해주세요.');
        return;
      }
      if (
        apiError?.status === 400 &&
        apiError.code === 'COMMON_INVALID_REQUEST'
      ) {
        const refreshed = await registrationQuery.refetch();
        if (parseApiError(refreshed.error)?.status === 401) {
          showExpiredAndLeave();
          return;
        }
        if (refreshed.data) {
          setForm((current) => ({
            ...current,
            agreements: Object.fromEntries(
              refreshed.data.terms.map((term) => [term.termsId, false]),
            ),
          }));
        }
        showToast('약관이 개정됐을 수 있어요. 다시 확인해주세요.');
        return;
      }
      if (apiError?.status === null) {
        showToast(
          '가입을 완료하지 못했어요. 네트워크 연결을 확인한 뒤 다시 시도해주세요.',
        );
        return;
      }
      showToast(
        `가입을 완료하지 못했어요. ${
          apiError?.message ??
          (error instanceof Error
            ? error.message
            : '잠시 후 다시 시도해주세요.')
        }`,
      );
    } finally {
      isSubmittingRef.current = false;
    }
  }

  if (isRegistrationTokenValid !== true) {
    return null;
  }

  return (
    <SafeAreaView className="bg-surface-default flex-1">
      <NavigationHeader
        title="정보 입력"
        onPressBack={handlePressBack}
        isBackDisabled={isRegistrationPending}
      />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-28 pt-24 pb-24"
      >
        {registrationQuery.data && (
          <SignupAgreementList
            terms={registrationQuery.data.terms}
            isAgeEligible={form.isAgeEligible}
            agreements={form.agreements}
            onToggleAgeEligible={handleToggleAgeEligible}
            onToggleTerms={handleToggleTerms}
            onPressTermsDetail={handlePressTermsDetail}
          />
        )}
      </ScrollView>
      <View className="px-24 pb-16">
        <Button
          label="동의하고 회원가입 완료하기"
          onPress={handlePressCompleteSignup}
          variant={isRequiredAgreementComplete ? 'primary' : 'secondary'}
          isDisabled={isRegistrationPending}
        />
      </View>
      {toastMessage ? (
        <Toast message={toastMessage} onDismiss={handleDismissToast} />
      ) : null}
    </SafeAreaView>
  );
}
