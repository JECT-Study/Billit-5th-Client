import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  APPLE_BUTTON_COLOR,
  BORDER_SUBTLE_COLOR,
  GRAY_008,
  KAKAO_BUTTON_COLOR,
  SCREEN_BACKGROUND_COLOR,
} from '@/shared/ui/colors';

const SOCIAL_LOGIN_OPTIONS = [
  {
    id: 'google',
    label: '구글로 계속하기',
    mark: 'G',
    backgroundColor: SCREEN_BACKGROUND_COLOR,
    textColor: GRAY_008,
    borderColor: BORDER_SUBTLE_COLOR,
  },
  {
    id: 'apple',
    label: '애플로 계속하기',
    mark: '',
    backgroundColor: APPLE_BUTTON_COLOR,
    textColor: SCREEN_BACKGROUND_COLOR,
    borderColor: APPLE_BUTTON_COLOR,
  },
  {
    id: 'kakao',
    label: '카카오로 계속하기',
    mark: 'TALK',
    backgroundColor: KAKAO_BUTTON_COLOR,
    textColor: GRAY_008,
    borderColor: KAKAO_BUTTON_COLOR,
  },
] as const;

export function LoginScreen() {
  function handlePressSocialLogin() {
    router.push('/signup');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SCREEN_BACKGROUND_COLOR }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text
          accessibilityRole="header"
          style={{ color: GRAY_008, fontSize: 36, fontWeight: '700' }}
        >
          Billit
        </Text>
      </View>
      <View style={{ gap: 12, paddingHorizontal: 24, paddingBottom: 32 }}>
        {SOCIAL_LOGIN_OPTIONS.map((option) => (
          <SocialLoginButton
            key={option.id}
            label={option.label}
            mark={option.mark}
            backgroundColor={option.backgroundColor}
            textColor={option.textColor}
            borderColor={option.borderColor}
            onPress={handlePressSocialLogin}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

type SocialLoginButtonProps = {
  label: string;
  mark: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  onPress: () => void;
};

function SocialLoginButton({
  label,
  mark,
  backgroundColor,
  textColor,
  borderColor,
  onPress,
}: SocialLoginButtonProps) {
  function handlePress() {
    onPress();
  }

  const hasMark = mark.length > 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={handlePress}
      style={{
        height: 52,
        borderRadius: 12,
        backgroundColor,
        borderColor,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {hasMark ? (
        <Text
          style={{
            position: 'absolute',
            left: 20,
            color: textColor,
            fontSize: 12,
            fontWeight: '700',
          }}
        >
          {mark}
        </Text>
      ) : null}
      <Text style={{ color: textColor, fontSize: 16, fontWeight: '600' }}>
        {label}
      </Text>
    </Pressable>
  );
}
