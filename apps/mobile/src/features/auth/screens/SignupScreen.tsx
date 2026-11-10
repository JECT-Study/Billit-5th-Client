import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NavigationHeader } from '@/shared/ui/NavigationHeader';
import { PrimaryButton } from '@/shared/ui/PrimaryButton';

export function SignupScreen() {
  function handlePressBack() {
    router.back();
  }

  function handlePressCompleteSignup() {
    router.push('/onboarding');
  }

  return (
    <SafeAreaView className="bg-canvas flex-1">
      <NavigationHeader title="정보 입력" onPressBack={handlePressBack} />
      <View className="flex-1 px-6 pt-6">
        <Text
          accessibilityRole="header"
          className="text-gray-008 text-xl font-semibold"
        >
          회원 정보 입력 및 동의
        </Text>
      </View>
      <View className="px-6 pb-4">
        <PrimaryButton
          label="동의하고 회원가입 완료하기"
          onPress={handlePressCompleteSignup}
        />
      </View>
    </SafeAreaView>
  );
}
