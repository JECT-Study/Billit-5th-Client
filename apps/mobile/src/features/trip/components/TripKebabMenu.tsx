import { Pressable, View } from 'react-native';

import { Text } from '@/shared/ui/Text';
import { SHADOW } from '@/theme/theme.generated';

type TripKebabMenuProps = {
  onPressCreateTrip: () => void;
  onPressJoinWithInviteCode: () => void;
};

export function TripKebabMenu({
  onPressCreateTrip,
  onPressJoinWithInviteCode,
}: TripKebabMenuProps) {
  function handlePressCreateTrip() {
    onPressCreateTrip();
  }

  function handlePressJoinWithInviteCode() {
    onPressJoinWithInviteCode();
  }

  return (
    <View
      className="rounded-8 w-[148px] overflow-hidden bg-white py-[5px]"
      style={{ boxShadow: SHADOW.light }}
    >
      <Pressable
        accessibilityRole="menuitem"
        onPress={handlePressCreateTrip}
        className="h-[40px] items-center justify-center px-10 py-6"
      >
        <Text className="text-label-1 text-strong font-medium">
          새 여행방 생성
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="menuitem"
        onPress={handlePressJoinWithInviteCode}
        className="h-[40px] items-center justify-center px-10 py-6"
      >
        <Text className="text-label-1 text-strong font-medium">
          초대코드 입력
        </Text>
      </Pressable>
    </View>
  );
}
