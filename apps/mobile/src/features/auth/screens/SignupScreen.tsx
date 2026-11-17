import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, BackHandler, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { parseApiError } from '@/lib/apiError';
import { NavigationHeader } from '@/shared/ui/NavigationHeader';
import { PrimaryButton } from '@/shared/ui/PrimaryButton';

import { useCompleteRegistrationMutation } from '@/features/auth/hooks/useCompleteRegistrationMutation';
import { useRegistrationQuery } from '@/features/auth/hooks/useRegistrationQuery';
import { RegistrationTokenExpiredError } from '@/features/auth/registrationTokenExpiredError';
import { getRegistrationToken } from '@/features/auth/services/authStorage';
import { clearRegistrationSession } from '@/features/auth/services/clearRegistrationSession';
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
  const [form, setForm] = useState<SignupDraft>(initialSignupDraft);
  const [isRegistrationTokenValid, setIsRegistrationTokenValid] = useState<
    boolean | null
  >(null);
  const isSubmittingRef = useRef(false);

  const handlePressBack = useCallback(() => {
    clearRegistrationSession();
    router.replace('/login');
  }, []);

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
        Alert.alert('약관을 불러오지 못했어요. 다시 시도해주세요.');
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
          Alert.alert('필수 약관에 동의해주세요.');
          return;
        }
        if (field === 'isAgeEligible') {
          Alert.alert('만 18세 이상인지 확인해주세요.');
          return;
        }
        Alert.alert(
          parsed.error.issues[0]?.message ?? '입력값을 확인해주세요.',
        );
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
        Alert.alert(apiError.message ?? '필수 약관에 동의해주세요.');
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
        Alert.alert('약관이 개정됐을 수 있어요. 다시 확인해주세요.');
        return;
      }
      if (apiError?.status === null) {
        Alert.alert(
          '가입을 완료하지 못했어요',
          '네트워크 연결을 확인한 뒤 다시 시도해주세요.',
        );
        return;
      }
      Alert.alert(
        '가입을 완료하지 못했어요',
        apiError?.message ??
          (error instanceof Error
            ? error.message
            : '잠시 후 다시 시도해주세요.'),
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
      <NavigationHeader title="정보 입력" onPressBack={handlePressBack} />
      <View className="flex-1" />
      <View className="px-24 pb-16">
        <PrimaryButton
          label="동의하고 회원가입 완료하기"
          onPress={handlePressCompleteSignup}
        />
      </View>
    </SafeAreaView>
  );
}
