import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NavigationHeader } from '@/shared/ui/NavigationHeader';
import { PrimaryButton } from '@/shared/ui/PrimaryButton';
import { Text } from '@/shared/ui/Text';

const ONBOARDING_STEPS = [
  {
    title: '해외여행 정산을\n하나의 방에서 관리해요',
    description: '메인 뷰 인터랙션 삽입',
  },
  {
    title: '여행에서 사용한 지출을\n동행자와 나눠요',
    description: '결제 기록 페이지 (참여자 금액 분배 인터랙션)',
  },
  {
    title: '원하는 지출을 골라\n언제든 정산해요',
    description: '정산하기 페이지 (결제 내역을 선택하는 인터랙션)',
  },
  {
    title: '간편하게 정산 관계를\n확인해요',
    description: '개인별 정산서 페이지 (상세 품목 & 송금 관계)',
  },
] as const;

export function OnboardingScreen() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const step = ONBOARDING_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === ONBOARDING_STEPS.length - 1;

  function handlePressBack() {
    if (isFirstStep) {
      router.back();
      return;
    }

    setCurrentStepIndex((stepIndex) => stepIndex - 1);
  }

  function handlePressBody() {
    if (isLastStep) {
      return;
    }

    setCurrentStepIndex((stepIndex) => stepIndex + 1);
  }

  function handlePressSkip() {
    router.replace('/trips');
  }

  function handlePressFinishSignup() {
    router.replace('/trips');
  }

  return (
    <SafeAreaView className="bg-surface-default flex-1">
      <NavigationHeader title="정보 입력" onPressBack={handlePressBack} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="다음 단계"
        onPress={handlePressBody}
        className="flex-1 px-24 pt-32"
      >
        <Text
          accessibilityRole="header"
          className="text-primary text-title-3 font-semibold"
        >
          {step.title}
        </Text>
        <View className="bg-sky-10 rounded-24 mt-32 flex-1 items-center justify-center px-24">
          <Text className="text-secondary text-label-1 text-center font-normal">
            {step.description}
          </Text>
        </View>
      </Pressable>
      <View className="px-24 pb-16 pt-24">
        {isLastStep ? (
          <PrimaryButton
            label="동의하고 회원가입 완료하기"
            onPress={handlePressFinishSignup}
          />
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="건너뛰기"
            onPress={handlePressSkip}
            className="h-58 items-center justify-center"
          >
            <Text className="text-secondary text-body-1 font-semibold">
              건너뛰기
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
