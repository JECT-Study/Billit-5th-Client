import { Text, View } from 'react-native';

type ScreenHeaderProps = {
  title: string;
};

export function ScreenHeader({ title }: ScreenHeaderProps) {
  return (
    <View className="h-12 items-center justify-center">
      <Text
        accessibilityRole="header"
        className="text-gray-008 text-center text-xl font-semibold"
      >
        {title}
      </Text>
    </View>
  );
}
