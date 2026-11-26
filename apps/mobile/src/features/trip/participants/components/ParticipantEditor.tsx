import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Participant } from '@/features/trip/tripDetailSchema';
import { nicknameSchema } from '@/features/trip/shared/tripCreationSchema';
import { Button } from '@/shared/ui/Button';
import { GradientText } from '@/shared/ui/GradientText';
import { InfoIcon } from '@/shared/ui/icons';
import { NavigationHeader } from '@/shared/ui/NavigationHeader';
import { Text } from '@/shared/ui/Text';
import { TextField } from '@/shared/ui/TextField';
import { Toast } from '@/shared/ui/Toast';
import { COLORS } from '@/theme/theme.generated';

type Props = {
  editing: Participant | 'new';
  nickname: string;
  nicknameError: string | undefined;
  isBusy: boolean;
  isNicknameDuplicated: boolean;
  isNicknameRequired: boolean;
  message: string | null;
  toast: { id: number; message: string } | null;
  onNicknameChange: (value: string) => void;
  onBack: () => void;
  onDelete: () => void;
  onSave: () => void;
  onDismissToast: () => void;
};

export function ParticipantEditor({
  editing,
  nickname,
  nicknameError,
  isBusy,
  isNicknameDuplicated,
  isNicknameRequired,
  message,
  toast,
  onNicknameChange,
  onBack,
  onDelete,
  onSave,
  onDismissToast,
}: Props) {
  const insets = useSafeAreaInsets();
  function handleBack() {
    onBack();
  }
  function handleDelete() {
    onDelete();
  }
  function handleSave() {
    onSave();
  }
  function handleDismissToast() {
    onDismissToast();
  }
  function handleNicknameChange(value: string) {
    onNicknameChange(value);
  }
  return (
    <View className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="bg-surface-subtle flex-1"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <View className="px-24">
          <NavigationHeader
            title={editing === 'new' ? '친구 직접 추가' : '닉네임 직접 수정'}
            onPressBack={handleBack}
            isBackDisabled={isBusy}
          />
        </View>
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="px-24 pt-14"
        >
          <GradientText
            text={
              editing === 'new'
                ? 'Billit을 사용하지 않는 친구를\n직접 추가할 수 있어요'
                : 'Billit을 사용하지 않는 친구의 닉네임을\n직접 수정해요'
            }
            size="headline-1"
            family="suit-semibold"
            className="text-headline-1 font-semibold"
            startColor={COLORS['gray-8']}
            endColor={COLORS['teal-gradient-end']}
          />
          <Text className="text-primary text-caption-1 mt-12 font-semibold">
            여행 참여자들이 알아볼 수 있는 닉네임을 적어주세요
          </Text>
          <View className="mt-24">
            <TextField
              label="닉네임"
              showLabel={false}
              value={nickname}
              placeholder="닉네임을 입력해주세요"
              maxLength={10}
              onChangeText={handleNicknameChange}
              hint="한글, 영문, 숫자 1~10자"
              isHintSatisfied={
                !isNicknameDuplicated &&
                nicknameSchema.safeParse(nickname).success
              }
              errorMessage={nicknameError}
              hasError={isNicknameDuplicated || isNicknameRequired}
            />
          </View>
          {message ? (
            <Text
              accessibilityRole="alert"
              className="text-caption-1 text-red-alert-dark mt-10"
            >
              {message}
            </Text>
          ) : null}
        </ScrollView>
        <View className="gap-18 px-24 pb-20">
          <View className="bg-surface-default rounded-8 gap-12 px-24 py-20">
            <View className="flex-row items-center gap-4">
              <InfoIcon size={18} />
              <Text className="text-primary text-label-1 font-semibold">
                직접 추가한 사용자 안내
              </Text>
            </View>
            <Text className="text-secondary text-caption-1">
              {
                '• 정산에 포함되지만, 결제자로 지정할 수 없습니다.\n• 추가 후, 여행방 오픈 전까지 이름을 수정할 수 있습니다.'
              }
            </Text>
          </View>
          <View className="flex-row gap-12">
            {editing !== 'new' ? (
              <Button
                label="참여자 삭제"
                variant="error"
                onPress={handleDelete}
                isDisabled={isBusy}
                className="flex-1"
              />
            ) : null}
            <Button
              label={editing === 'new' ? '추가하기' : '수정하기'}
              onPress={handleSave}
              isDisabled={isBusy}
              className="flex-1"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
      {toast ? (
        <Toast
          key={toast.id}
          message={toast.message}
          backgroundColor={COLORS['gray-2']}
          onDismiss={handleDismissToast}
        />
      ) : null}
    </View>
  );
}
