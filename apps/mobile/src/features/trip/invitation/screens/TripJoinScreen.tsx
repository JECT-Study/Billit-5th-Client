import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useJoinTripMutation } from '@/features/trip/invitation/hooks/useJoinTripMutation';
import {
  getTripCreationTextFieldError,
  nicknameSchema,
} from '@/features/trip/shared/tripCreationSchema';
import { getTripJoinErrorResult } from '@/features/trip/invitation/tripJoin';
import { Button } from '@/shared/ui/Button';
import { GradientText } from '@/shared/ui/GradientText';
import { InfoIcon } from '@/shared/ui/icons';
import { NavigationHeader } from '@/shared/ui/NavigationHeader';
import { Text } from '@/shared/ui/Text';
import { TextField } from '@/shared/ui/TextField';
import { Toast } from '@/shared/ui/Toast';
import { COLORS, TEXT_COLORS } from '@/theme/theme.generated';

const REQUIRED_INPUT_MESSAGE = '필수 입력란을 채워주세요!';

type ToastState = { message: string; shouldLeave: boolean };

export function TripJoinScreen() {
  const { inviteCode } = useLocalSearchParams<{ inviteCode?: string }>();
  const joinTripMutation = useJoinTripMutation();
  const [nickname, setNickname] = useState('');
  const [isRequiredErrorShown, setIsRequiredErrorShown] = useState(false);
  const [isNicknameRejected, setIsNicknameRejected] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const isNicknameValid = nicknameSchema.safeParse(nickname).success;
  // 빈 입력은 형식 오류 대신 제출할 때 필수 입력 토스트로 알린다.
  const nicknameErrorMessage = getTripCreationTextFieldError(
    'nickname',
    nickname,
  );
  const isLeaving = toast?.shouldLeave === true;

  function goToTrips() {
    // TODO: 여행방 상세 화면이 생기면 해당 여행방으로 이동
    router.replace('/trips');
  }

  function handlePressBack() {
    router.back();
  }

  function handleChangeNickname(value: string) {
    setIsRequiredErrorShown(false);
    setIsNicknameRejected(false);
    setNickname(value);
  }

  async function handleSubmit() {
    if (nickname === '') {
      setIsRequiredErrorShown(true);
      setToast({ message: REQUIRED_INPUT_MESSAGE, shouldLeave: false });
      return;
    }
    if (!isNicknameValid) return;
    if (!inviteCode) {
      router.replace('/trips');
      return;
    }

    try {
      await joinTripMutation.mutateAsync({
        inviteCode,
        tripNickname: nickname,
      });
      goToTrips();
    } catch (error) {
      const result = getTripJoinErrorResult(error);
      setIsNicknameRejected(result.isNicknameError);
      setToast({ message: result.message, shouldLeave: result.shouldLeave });
    }
  }

  function handleDismissToast() {
    const shouldLeave = toast?.shouldLeave;
    setToast(null);
    if (shouldLeave) router.replace('/trips');
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      className="bg-surface-subtle flex-1"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="px-24">
          <NavigationHeader
            title="닉네임 설정"
            onPressBack={handlePressBack}
            isBackDisabled={joinTripMutation.isPending}
          />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-24 px-24 pb-24 pt-24"
          keyboardShouldPersistTaps="handled"
        >
          <GradientText
            text={'이 여행방에서 사용할 닉네임을\n설정해주세요'}
            size="headline-1"
            family="suit-semibold"
            className="text-headline-1 font-semibold"
            startColor={COLORS['gray-8']}
            endColor={COLORS['teal-gradient-end']}
          />
          <TextField
            label="닉네임"
            value={nickname}
            placeholder="닉네임을 입력해주세요"
            maxLength={10}
            onChangeText={handleChangeNickname}
            hint="한글, 영문, 숫자 1~10자"
            isHintSatisfied={isNicknameValid}
            errorMessage={nicknameErrorMessage}
            hasError={isRequiredErrorShown || isNicknameRejected}
            autoFocus
          />
        </ScrollView>

        <View className="gap-18 px-24 pb-8 pt-8">
          <View className="rounded-8 bg-surface-default gap-16 px-24 py-20">
            <View className="flex-row items-center gap-4">
              <InfoIcon size={18} color={TEXT_COLORS.primary} />
              <Text className="text-primary text-label-1 font-semibold">
                닉네임 안내
              </Text>
            </View>
            <Text className="text-secondary text-caption-1 font-semibold">
              {'•  여행방 참여 이후에 수정할 수 있습니다.'}
            </Text>
          </View>
          <Button
            label="이 여행 참여하기"
            variant={isNicknameValid ? 'primary' : 'secondary'}
            onPress={handleSubmit}
            isDisabled={joinTripMutation.isPending || isLeaving}
          />
        </View>
      </KeyboardAvoidingView>

      {toast ? (
        <Toast message={toast.message} onDismiss={handleDismissToast} />
      ) : null}
    </SafeAreaView>
  );
}
