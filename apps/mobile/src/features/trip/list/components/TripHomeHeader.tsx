import { Pressable, View } from 'react-native';

import { BellIcon } from '@/shared/ui/icons';
import { Text } from '@/shared/ui/Text';

type TripHomeHeaderProps = {
  onPressNotification: () => void;
};

export function TripHomeHeader({ onPressNotification }: TripHomeHeaderProps) {
  function handlePressNotification() {
    onPressNotification();
  }

  return (
    <View className="h-48 flex-row items-center justify-between pl-24 pr-12">
      {/* 헤더용 로고 에셋이 아직 없어 텍스트로 표시 */}
      <Text
        accessibilityRole="header"
        className="text-brand text-heading-1 font-bold"
      >
        Billit
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="알림"
        onPress={handlePressNotification}
        className="h-48 w-48 items-center justify-center"
      >
        <BellIcon />
      </Pressable>
    </View>
  );
}
