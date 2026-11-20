import { useState } from 'react';
import { View } from 'react-native';

import { DropdownField } from '@/shared/ui/DropdownField';
import { DropdownMenu } from '@/shared/ui/DropdownMenu';
import { Text } from '@/shared/ui/Text';

type TripMemberCapacityFieldProps = {
  value: number | null;
  onChange: (value: number) => void;
};

const MEMBER_COUNT_OPTIONS = Array.from({ length: 10 }, (_, index) => ({
  value: String(index + 1),
  label: `${index + 1}명`,
}));

export function TripMemberCapacityField({
  value,
  onChange,
}: TripMemberCapacityFieldProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handleToggleMenu() {
    setIsMenuOpen((current) => !current);
  }

  function handleSelect(valueString: string) {
    onChange(Number(valueString));
    setIsMenuOpen(false);
  }

  return (
    <View className="z-10 gap-10">
      <Text className="text-secondary text-label-1 font-medium">
        초대할 동행자는 몇 명인가요?
      </Text>
      <DropdownField
        label={value ? `${value}명` : '인원 선택'}
        accessibilityLabel="동행자 수 선택"
        onPress={handleToggleMenu}
      />
      {isMenuOpen ? (
        <View className="absolute right-0 top-[64px] w-[149px]">
          <DropdownMenu
            options={MEMBER_COUNT_OPTIONS}
            selectedValue={value ? String(value) : undefined}
            onSelect={handleSelect}
          />
        </View>
      ) : null}
    </View>
  );
}
