import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import {
  CalendarIcon,
  ClearIcon,
  TriangleDownFillIcon,
} from '@/shared/ui/icons';
import { Text } from '@/shared/ui/Text';
import { COLORS } from '@/theme/theme.generated';

type DropdownFieldProps = {
  label: string;
  onPress: () => void;
  leading?: ReactNode;
  variant?: 'plain' | 'date-compact';
  accessibilityLabel?: string;
  // Figma에 비활성 시안이 없어 action-disabled 토큰으로 표시한다.
  isDisabled?: boolean;
  isFlexible?: boolean;
  onPressClear?: () => void;
  clearAccessibilityLabel?: string;
};

export function DropdownField({
  label,
  onPress,
  leading,
  variant = 'plain',
  accessibilityLabel,
  isDisabled = false,
  isFlexible = true,
  onPressClear,
  clearAccessibilityLabel = '선택 지우기',
}: DropdownFieldProps) {
  function handlePress() {
    onPress();
  }

  function handlePressClear() {
    onPressClear?.();
  }

  const isDateCompact = variant === 'date-compact';
  const iconColor = isDisabled
    ? COLORS['action-disabled-foreground']
    : COLORS['gray-6'];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={handlePress}
      className={`border-gray-2 rounded-8 h-[46px] flex-row items-center border ${isFlexible ? 'flex-1' : ''} ${isDateCompact ? 'justify-center gap-6 px-12' : 'px-18 justify-between'} ${isDisabled ? 'bg-action-disabled-background' : ''}`}
    >
      <View className="flex-row items-center gap-6">
        {isDateCompact ? <CalendarIcon color={iconColor} /> : leading}
        <Text
          className={`text-body-2 font-medium ${isDisabled ? 'text-action-disabled-foreground' : 'text-strong'}`}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
      {onPressClear && !isDisabled ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={clearAccessibilityLabel}
          hitSlop={8}
          onPress={handlePressClear}
          className="-m-[2px]"
        >
          <ClearIcon />
        </Pressable>
      ) : (
        <TriangleDownFillIcon color={iconColor} />
      )}
    </Pressable>
  );
}
