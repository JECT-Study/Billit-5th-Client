import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  GRAY_008,
  SCREEN_BACKGROUND_COLOR,
  SURFACE_MUTED_COLOR,
  TEXT_SECONDARY,
} from '@/shared/ui/colors';
import { NavigationHeader } from '@/shared/ui/NavigationHeader';
import { PrimaryButton } from '@/shared/ui/PrimaryButton';

const ONBOARDING_STEPS = [
  {
    title: '해외여행 정산을 하나의 방에서 관리해요',
    description: '메인 뷰 인터랙션 삽입',
  },
  {
    title: '여행에서 사용한 지출을 동행자와 나눠요',
    description: '결제 기록 페이지 (참여자 금액 분배 인터랙션)',
  },
  {
    title: '원하는 지출을 골라 언제든 정산해요',
    description: '정산하기 페이지 (결제 내역을 선택하는 인터랙션)',
  },
  {
    title: '간편하게 정산 관계를 확인해요',
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
    <SafeAreaView style={{ flex: 1, backgroundColor: SCREEN_BACKGROUND_COLOR }}>
      <NavigationHeader title="정보 입력" onPressBack={handlePressBack} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="다음 단계"
        onPress={handlePressBody}
        style={{ flex: 1, paddingHorizontal: 24, paddingTop: 32 }}
      >
        <Text
          accessibilityRole="header"
          style={{
            color: GRAY_008,
            fontSize: 24,
            fontWeight: '600',
            lineHeight: 34,
          }}
        >
          {step.title}
        </Text>
        <View
          style={{
            marginTop: 32,
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 24,
            backgroundColor: SURFACE_MUTED_COLOR,
            paddingHorizontal: 24,
          }}
        >
          <Text
            style={{
              color: TEXT_SECONDARY,
              fontSize: 14,
              textAlign: 'center',
            }}
          >
            {step.description}
          </Text>
        </View>
      </Pressable>
      <View
        style={{ paddingHorizontal: 24, paddingBottom: 16, paddingTop: 24 }}
      >
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
            style={{
              height: 52,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{ color: TEXT_SECONDARY, fontSize: 16, fontWeight: '600' }}
            >
              건너뛰기
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
