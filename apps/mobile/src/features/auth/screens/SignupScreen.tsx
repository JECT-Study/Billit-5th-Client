import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GRAY_008, SCREEN_BACKGROUND_COLOR } from '@/shared/ui/colors';
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
    <SafeAreaView style={{ flex: 1, backgroundColor: SCREEN_BACKGROUND_COLOR }}>
      <NavigationHeader title="정보 입력" onPressBack={handlePressBack} />
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
        <Text
          accessibilityRole="header"
          style={{ color: GRAY_008, fontSize: 20, fontWeight: '600' }}
        >
          회원 정보 입력 및 동의
        </Text>
      </View>
      <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
        <PrimaryButton
          label="동의하고 회원가입 완료하기"
          onPress={handlePressCompleteSignup}
        />
      </View>
    </SafeAreaView>
  );
}
