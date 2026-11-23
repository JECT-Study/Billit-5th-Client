import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  View,
} from 'react-native';

import { CloseMdIcon } from '@/shared/ui/icons';
import { Text } from '@/shared/ui/Text';
import { TEXT_COLORS } from '@/theme/theme.generated';

type DialogProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  // 토스트처럼 카드 밖, 화면 전체 위에 겹쳐 보여줄 요소. Modal은 화면 위에 따로 그려지므로
  // 팝업이 열려 있는 동안 보여줄 토스트는 여기로 넘겨야 팝업 위에 보인다.
  overlay?: ReactNode;
};

// 입력이 있는 팝업이 실수로 닫히지 않게 배경을 눌러도 닫지 않고, 닫기 버튼과 안드로이드 뒤로가기로만 닫는다.
export function Dialog({
  visible,
  title,
  onClose,
  children,
  overlay,
}: DialogProps) {
  function handleClose() {
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 items-center justify-center bg-black/60 px-24"
      >
        <View className="rounded-30 bg-surface-default pt-30 w-full px-20 pb-20">
          <View className="flex-row items-center justify-center">
            <Text className="text-strong text-heading-1 font-semibold">
              {title}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="닫기"
              hitSlop={8}
              onPress={handleClose}
              className="absolute right-4"
            >
              <CloseMdIcon color={TEXT_COLORS.strong} />
            </Pressable>
          </View>
          {children}
        </View>
      </KeyboardAvoidingView>
      {overlay}
    </Modal>
  );
}
