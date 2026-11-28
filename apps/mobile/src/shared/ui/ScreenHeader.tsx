import { View } from 'react-native';

import { Text } from '@/shared/ui/Text';

type ScreenHeaderProps = {
  title: string;
};

export function ScreenHeader({ title }: ScreenHeaderProps) {
  return (
    <View className="h-44 items-center justify-center">
      <Text
        accessibilityRole="header"
        className="text-strong text-body-1 text-center font-semibold"
      >
        {title}
      </Text>
    </View>
  );
}
