import { Pressable, ScrollView, View } from 'react-native';

import { CheckIcon } from '@/shared/ui/icons';
import { Text } from '@/shared/ui/Text';
import { COLORS, SHADOW } from '@/theme/theme.generated';

type DropdownMenuOption = {
  value: string;
  label: string;
};

type DropdownMenuProps = {
  options: readonly DropdownMenuOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  maxHeight?: number;
};

export function DropdownMenu({
  options,
  selectedValue,
  onSelect,
  maxHeight,
}: DropdownMenuProps) {
  const rows = options.map((option) => {
    const isSelected = option.value === selectedValue;

    function handlePress() {
      onSelect(option.value);
    }

    return (
      <Pressable
        key={option.value}
        accessibilityRole="button"
        accessibilityLabel={option.label}
        accessibilityState={{ selected: isSelected }}
        onPress={handlePress}
        className="h-40 flex-row items-center justify-between px-10 py-6"
      >
        <View className="h-24 w-24" />
        <Text
          className={`text-label-1 font-medium ${isSelected ? 'text-action-primary-background' : 'text-strong'}`}
        >
          {option.label}
        </Text>
        <View className="h-24 w-24">
          {isSelected ? (
            <CheckIcon color={COLORS['action-primary-background']} />
          ) : null}
        </View>
      </Pressable>
    );
  });

  return (
    <View
      style={{ boxShadow: SHADOW.light }}
      className="bg-surface-default rounded-8 overflow-hidden py-6"
    >
      {maxHeight ? (
        <ScrollView
          style={{ maxHeight }}
          contentContainerClassName="gap-8"
          nestedScrollEnabled
        >
          {rows}
        </ScrollView>
      ) : (
        <View className="gap-8">{rows}</View>
      )}
    </View>
  );
}
