import { router } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NavigationHeader } from '@/shared/ui/NavigationHeader';
import { PrimaryButton } from '@/shared/ui/PrimaryButton';
import { Text } from '@/shared/ui/Text';

export function SignupScreen() {
  function handlePressBack() {
    router.back();
  }

  function handlePressCompleteSignup() {
    router.push('/onboarding');
  }

  return (
    <SafeAreaView className="bg-surface-default flex-1">
      <NavigationHeader title="정보 입력" onPressBack={handlePressBack} />
      <View className="flex-1 px-24 pt-24">
        <Text
          accessibilityRole="header"
          className="text-primary text-heading-2 font-semibold"
        >
          회원 정보 입력 및 동의
        </Text>
      </View>
      <View className="px-24 pb-16">
        <PrimaryButton
          label="동의하고 회원가입 완료하기"
          onPress={handlePressCompleteSignup}
        />
      </View>
    </SafeAreaView>
  );
}
