import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SOCIAL_LOGIN_OPTIONS = [
  {
    id: 'google',
    label: '구글로 계속하기',
    mark: 'G',
    buttonClassName: 'border-line bg-canvas',
    textClassName: 'text-gray-008',
  },
  {
    id: 'apple',
    label: '애플로 계속하기',
    mark: '',
    buttonClassName: 'border-apple bg-apple',
    textClassName: 'text-canvas',
  },
  {
    id: 'kakao',
    label: '카카오로 계속하기',
    mark: 'TALK',
    buttonClassName: 'border-kakao bg-kakao',
    textClassName: 'text-gray-008',
  },
] as const;

export function LoginScreen() {
  function handlePressSocialLogin() {
    router.push('/signup');
  }

  return (
    <SafeAreaView className="bg-canvas flex-1">
      <View className="flex-1 items-center justify-center">
        <Text
          accessibilityRole="header"
          className="text-gray-008 text-4xl font-bold"
        >
          Billit
        </Text>
      </View>
      <View className="gap-3 px-6 pb-8">
        {SOCIAL_LOGIN_OPTIONS.map((option) => (
          <SocialLoginButton
            key={option.id}
            label={option.label}
            mark={option.mark}
            buttonClassName={option.buttonClassName}
            textClassName={option.textClassName}
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
  buttonClassName: string;
  textClassName: string;
  onPress: () => void;
};

function SocialLoginButton({
  label,
  mark,
  buttonClassName,
  textClassName,
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
      className={`h-14 items-center justify-center rounded-xl border ${buttonClassName}`}
    >
      {hasMark ? (
        <Text className={`absolute left-5 text-xs font-bold ${textClassName}`}>
          {mark}
        </Text>
      ) : null}
      <Text className={`text-base font-semibold ${textClassName}`}>
        {label}
      </Text>
    </Pressable>
  );
}
