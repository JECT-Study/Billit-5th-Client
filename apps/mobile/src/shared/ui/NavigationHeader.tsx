import { Pressable, Text, View } from 'react-native';

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
    <View className="h-12 flex-row items-center">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="뒤로 가기"
        onPress={handlePressBack}
        className="h-12 w-12 items-center justify-center"
      >
        <Text className="text-gray-008 text-3xl font-normal leading-8">‹</Text>
      </Pressable>
      <Text
        accessibilityRole="header"
        numberOfLines={1}
        className="text-gray-008 flex-1 text-center text-xl font-semibold"
      >
        {title}
      </Text>
      <View className="w-12" />
    </View>
  );
}
