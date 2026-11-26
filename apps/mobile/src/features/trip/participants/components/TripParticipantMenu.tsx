import { Pressable, View } from 'react-native';

import { Text } from '@/shared/ui/Text';
import { SHADOW } from '@/theme/theme.generated';

type Props = {
  onShare: () => void;
  onSettings: () => void;
};

export function TripParticipantMenu({ onShare, onSettings }: Props) {
  function handleShare() {
    onShare();
  }

  function handleSettings() {
    onSettings();
  }

  return (
    <View
      className="rounded-8 w-[148px] gap-8 bg-white py-6"
      style={{ boxShadow: SHADOW.light }}
    >
      <Pressable
        accessibilityRole="menuitem"
        onPress={handleShare}
        className="h-[40px] items-center justify-center px-10"
      >
        <Text className="text-label-1 text-strong font-medium">
          초대코드 공유
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="menuitem"
        onPress={handleSettings}
        className="h-[40px] items-center justify-center px-10"
      >
        <Text className="text-label-1 text-strong font-medium">
          여행방 설정
        </Text>
      </Pressable>
    </View>
  );
}
