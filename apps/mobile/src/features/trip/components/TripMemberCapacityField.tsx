import { useState } from 'react';
import { View } from 'react-native';

import { DropdownField } from '@/shared/ui/DropdownField';
import { DropdownMenu } from '@/shared/ui/DropdownMenu';
import { Text } from '@/shared/ui/Text';
import { COLORS } from '@/theme/theme.generated';

type TripMemberCapacityFieldProps = {
  value: number | null;
  onChange: (value: number) => void;
  label?: string;
  // 이보다 적은 인원은 고를 수 없다(여행방 설정: 현재 참여 인원).
  minValue?: number;
  isDisabled?: boolean;
};

const MEMBER_COUNT_OPTIONS = Array.from({ length: 10 }, (_, index) => ({
  value: String(index + 1),
  label: `${index + 1}명`,
}));

const BELOW_MIN_VALUE_MESSAGE = '현재 참여 인원보다 적게 줄일 수 없어요';

export function TripMemberCapacityField({
  value,
  onChange,
  label = '본인을 포함해, 총 몇 명이 여행하나요?',
  minValue = 1,
  isDisabled = false,
}: TripMemberCapacityFieldProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBelowMinValue, setIsBelowMinValue] = useState(false);

  function handleToggleMenu() {
    setIsMenuOpen((current) => !current);
  }

  function handleSelect(valueString: string) {
    const selectedValue = Number(valueString);
    setIsMenuOpen(false);

    // 최솟값보다 작으면 값을 바꾸지 않고 이유만 알려준다.
    if (selectedValue < minValue) {
      setIsBelowMinValue(true);
      return;
    }
    setIsBelowMinValue(false);
    onChange(selectedValue);
  }

  return (
    <View className="z-10 gap-10">
      <Text className="text-secondary text-label-1 font-medium">{label}</Text>
      <DropdownField
        label={value ? `${value}명` : '인원 선택'}
        accessibilityLabel="동행자 수 선택"
        onPress={handleToggleMenu}
        isDisabled={isDisabled}
      />
      {isBelowMinValue ? (
        <Text
          className="text-caption-2 font-semibold"
          style={{ color: COLORS['red-alert-dark'] }}
        >
          {BELOW_MIN_VALUE_MESSAGE}
        </Text>
      ) : null}
      {isMenuOpen && !isDisabled ? (
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
