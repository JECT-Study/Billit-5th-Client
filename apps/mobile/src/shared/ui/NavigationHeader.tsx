import { Pressable, View } from 'react-native';

import { Text } from '@/shared/ui/Text';

type NavigationHeaderProps = {
  title: string;
  onPressBack: () => void;
};

export function NavigationHeader({
  title,
  onPressBack,
}: NavigationHeaderProps) {
  function handlePressBack() {
    onPressBack();
  }

  return (
    <View className="h-48 flex-row items-center">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="뒤로 가기"
        onPress={handlePressBack}
        className="h-48 w-48 items-center justify-center"
      >
        <Text className="text-primary text-title-2 font-normal">‹</Text>
      </Pressable>
      <Text
        accessibilityRole="header"
        numberOfLines={1}
        className="text-primary text-heading-2 flex-1 text-center font-semibold"
      >
        {title}
      </Text>
      <View className="w-48" />
    </View>
  );
}
