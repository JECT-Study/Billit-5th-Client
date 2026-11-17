import { Stack } from 'expo-router';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const unstable_settings = {
  initialRouteName: 'login',
};

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* iOS 가장자리 스와이프로 가입 화면을 나가지 않는다 */}
      <Stack.Screen name="signup" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
