import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { CaretLeftMdIcon } from '@/shared/ui/icons';
import { Text } from '@/shared/ui/Text';

type NavigationHeaderProps = {
  title: string;
  onPressBack: () => void;
  isBackDisabled?: boolean;
  right?: ReactNode;
};

export function NavigationHeader({
  title,
  onPressBack,
  isBackDisabled = false,
  right,
}: NavigationHeaderProps) {
  function handlePressBack() {
    onPressBack();
  }

  return (
    <View className="h-48 flex-row items-center">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="뒤로 가기"
        accessibilityState={{ disabled: isBackDisabled }}
        disabled={isBackDisabled}
        onPress={handlePressBack}
        className={`h-48 w-48 items-center justify-center ${isBackDisabled ? 'opacity-50' : ''}`}
      >
        <CaretLeftMdIcon />
      </Pressable>
      <Text
        accessibilityRole="header"
        numberOfLines={1}
        className="text-primary text-heading-2 flex-1 text-center font-semibold"
      >
        {title}
      </Text>
      <View className="h-48 w-48 items-center justify-center">{right}</View>
    </View>
  );
}
