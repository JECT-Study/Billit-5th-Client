import { Image, type ImageSource } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import BillitLogo from '@/assets/images/login/logo.svg';
import { Text } from '@/shared/ui/Text';
import { COLORS } from '@/theme/theme.generated';

// Figma 로컬 페인트 스타일 "bg" (white → #CEEEFF, 위에서 아래로). 아직 토큰으로 등록되지 않은 값임
const BACKGROUND_GRADIENT_END = '#CEEEFF';

const SOCIAL_LOGIN_OPTIONS = [
  {
    id: 'google',
    label: '구글로 계속하기',
    logo: require('@/assets/images/login/google.png') as ImageSource,
    logoSize: 20,
    buttonClassName: 'border border-default bg-surface-default',
    textClassName: 'text-strong',
  },
  {
    id: 'apple',
    label: '애플로 계속하기',
    logo: require('@/assets/images/login/apple.png') as ImageSource,
    logoSize: 24,
    buttonClassName: 'bg-gray-8',
    textClassName: 'text-white',
  },
  {
    id: 'kakao',
    label: '카카오로 계속하기',
    logo: require('@/assets/images/login/kakao.png') as ImageSource,
    logoSize: 24,
    buttonClassName: 'bg-social-kakao-background',
    textClassName: 'text-social-kakao-foreground',
  },
] as const;

export function LoginScreen() {
  function handlePressSocialLogin() {
    router.push('/signup');
  }

  return (
    <View className="flex-1">
      <BackgroundGradient />
      <SafeAreaView className="flex-1">
        {/* 로고: 버튼 위 남은 공간의 가운데에서 pb-58만큼 위로 (Figma 로고 위치와 맞춤) */}
        <View
          className="pb-58 flex-1 items-center justify-center"
          accessible
          accessibilityRole="header"
          accessibilityLabel="Billit"
        >
          {/* TODO: 로고 애니메이션 추가 예정 (Figma 주석: UI 완료 후) */}
          <BillitLogo />
        </View>
        <View className="mb-58 gap-18 pb-58 px-24">
          {SOCIAL_LOGIN_OPTIONS.map((option) => (
            <SocialLoginButton
              key={option.id}
              label={option.label}
              logo={option.logo}
              logoSize={option.logoSize}
              buttonClassName={option.buttonClassName}
              textClassName={option.textClassName}
              onPress={handlePressSocialLogin}
            />
          ))}
        </View>
      </SafeAreaView>
    </View>
  );
}

function BackgroundGradient() {
  return (
    <View className="absolute inset-0" pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="loginBackground" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={COLORS.white} />
            <Stop offset="1" stopColor={BACKGROUND_GRADIENT_END} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#loginBackground)" />
      </Svg>
    </View>
  );
}

type SocialLoginButtonProps = {
  label: string;
  logo: ImageSource;
  logoSize: number;
  buttonClassName: string;
  textClassName: string;
  onPress: () => void;
};

function SocialLoginButton({
  label,
  logo,
  logoSize,
  buttonClassName,
  textClassName,
  onPress,
}: SocialLoginButtonProps) {
  function handlePress() {
    onPress();
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={handlePress}
      className={`rounded-12 flex-row items-center gap-10 px-10 py-12 ${buttonClassName}`}
    >
      <View className="h-24 w-24 items-center justify-center">
        <Image
          source={logo}
          style={{ width: logoSize, height: logoSize }}
          contentFit="contain"
          accessible={false}
        />
      </View>
      <Text
        className={`text-headline-1 flex-1 text-center font-semibold ${textClassName}`}
      >
        {label}
      </Text>
      <View className="h-24 w-24" />
    </Pressable>
  );
}
