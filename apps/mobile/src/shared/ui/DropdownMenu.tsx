import { Pressable, View } from 'react-native';

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
};

export function DropdownMenu({
  options,
  selectedValue,
  onSelect,
}: DropdownMenuProps) {
  return (
    <View
      style={{ boxShadow: SHADOW.light }}
      className="bg-surface-default rounded-8 overflow-hidden py-[5px]"
    >
      {options.map((option) => {
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
            {/* 텍스트를 가운데에 두기 위한 체크 아이콘 크기의 빈 자리 */}
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
      })}
    </View>
  );
}
