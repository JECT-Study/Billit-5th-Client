import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/shared/ui/Button';
import { NavigationHeader } from '@/shared/ui/NavigationHeader';
import { StepIndicator } from '@/shared/ui/StepIndicator';
import { Text } from '@/shared/ui/Text';

import { OnboardingTitle } from '@/features/auth/components/OnboardingTitle';

// Figma 화면 배경: 위쪽 흰색 → 아래쪽 #F1FAFF
const SCREEN_BACKGROUND = 'linear-gradient(167deg, #FFFFFF 30%, #F1FAFF 100%)';
// Figma 카드: 위 #E9FFE4 → 아래 #4EC1FF 6%, 안쪽 흰색 그림자
const CARD_BACKGROUND =
  'linear-gradient(180deg, #E9FFE4 0%, rgba(78, 193, 255, 0.06) 100%)';
const CARD_INNER_SHADOW = 'inset 0px 0px 50px 5px #FFFFFF';

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
    <SafeAreaView
      className="flex-1"
      style={{ experimental_backgroundImage: SCREEN_BACKGROUND }}
    >
      <NavigationHeader title="정보 입력" onPressBack={handlePressBack} />
      <StepIndicator
        stepCount={ONBOARDING_STEPS.length}
        currentStepIndex={currentStepIndex}
        className="mt-18 mx-24"
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="다음 단계"
        onPress={handlePressBody}
        className="flex-1 px-24 pt-[26px]"
      >
        <OnboardingTitle title={step.title} />
        <View
          className="rounded-30 mt-[65px] flex-1 items-center justify-center px-24"
          style={{
            experimental_backgroundImage: CARD_BACKGROUND,
            boxShadow: CARD_INNER_SHADOW,
          }}
        >
          <Text className="text-sky-80 text-caption-1 text-center font-semibold">
            {step.description}
          </Text>
        </View>
      </Pressable>
      <View className="px-24 pb-8 pt-[34px]">
        {isLastStep ? (
          <Button
            label="동의하고 회원가입 완료하기"
            onPress={handlePressFinishSignup}
          />
        ) : (
          <Button variant="light" label="건너뛰기" onPress={handlePressSkip} />
        )}
      </View>
    </SafeAreaView>
  );
}
