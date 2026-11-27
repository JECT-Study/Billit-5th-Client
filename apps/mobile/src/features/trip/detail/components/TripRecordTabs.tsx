import { Pressable, View } from 'react-native';

import { Text } from '@/shared/ui/Text';

export type TripRecordTab = 'EXPENSE' | 'SETTLEMENT';

const TAB_OPTIONS: readonly { value: TripRecordTab; label: string }[] = [
  { value: 'EXPENSE', label: '지출 내역' },
  { value: 'SETTLEMENT', label: '정산 내역' },
];

type TripRecordTabsProps = {
  value: TripRecordTab;
  onChange: (tab: TripRecordTab) => void;
};

export function TripRecordTabs({ value, onChange }: TripRecordTabsProps) {
  return (
    <View accessibilityRole="tablist" className="flex-row">
      {TAB_OPTIONS.map((option) => {
        const isSelected = option.value === value;

        function handlePress() {
          onChange(option.value);
        }

        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            onPress={handlePress}
            className={`flex-1 items-center border-b px-10 py-6 ${isSelected ? 'border-black' : 'border-gray-2'}`}
          >
            <Text className="text-label-1 text-primary font-medium">
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
