import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { CalendarIcon, TriangleDownFillIcon } from '@/shared/ui/icons';
import { Text } from '@/shared/ui/Text';
import { COLORS } from '@/theme/theme.generated';

type DropdownFieldProps = {
  label: string;
  onPress: () => void;
  leading?: ReactNode;
  variant?: 'plain' | 'date-compact';
  accessibilityLabel?: string;
};

export function DropdownField({
  label,
  onPress,
  leading,
  variant = 'plain',
  accessibilityLabel,
}: DropdownFieldProps) {
  function handlePress() {
    onPress();
  }

  const isDateCompact = variant === 'date-compact';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={handlePress}
      className={`border-gray-2 rounded-8 h-[46px] flex-1 flex-row items-center border ${isDateCompact ? 'justify-center gap-6 px-12' : 'px-18 justify-between'}`}
    >
      <View className="flex-row items-center gap-6">
        {isDateCompact ? <CalendarIcon color={COLORS['gray-6']} /> : leading}
        <Text className="text-strong text-body-2 font-medium" numberOfLines={1}>
          {label}
        </Text>
      </View>
      <TriangleDownFillIcon color={COLORS['gray-6']} />
    </Pressable>
  );
}
