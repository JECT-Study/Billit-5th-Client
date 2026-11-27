import { Pressable, View } from 'react-native';

import { BellIcon } from '@/shared/ui/icons';
import { Text } from '@/shared/ui/Text';
import { COLORS } from '@/theme/theme.generated';

type TripHomeHeaderProps = {
  onPressNotification: () => void;
};

export function TripHomeHeader({ onPressNotification }: TripHomeHeaderProps) {
  function handlePressNotification() {
    onPressNotification();
  }

  return (
    // Figma: Navigation / Header, Type=logo (2260:17396)
    // 종 아이콘(22)이 오른쪽 24에 오도록 누르는 영역 44 + 오른쪽 여백 13
    <View className="h-48 flex-row items-center justify-between pl-24 pr-[13px]">
      {/* 헤더용 로고 에셋이 아직 없어 텍스트로 표시 */}
      <Text
        accessibilityRole="header"
        className="text-heading-2 font-semibold text-black"
      >
        Billit
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="알림"
        onPress={handlePressNotification}
        className="h-48 w-44 items-center justify-center"
      >
        <BellIcon size={22} color={COLORS['gray-6']} />
      </Pressable>
    </View>
  );
}
