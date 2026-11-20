import { View } from 'react-native';

import TildeIcon from '@/assets/images/tilde.svg';
import { DropdownField } from '@/shared/ui/DropdownField';

type DropdownDateRangeProps = {
  startDate: string;
  endDate: string;
  onPressStartDate: () => void;
  onPressEndDate: () => void;
};

export function DropdownDateRange({
  startDate,
  endDate,
  onPressStartDate,
  onPressEndDate,
}: DropdownDateRangeProps) {
  function handlePressStartDate() {
    onPressStartDate();
  }

  function handlePressEndDate() {
    onPressEndDate();
  }

  return (
    <View className="flex-row items-center gap-6">
      <DropdownField
        label={startDate ? startDate.replaceAll('-', '.') : '시작일'}
        accessibilityLabel="시작일 선택"
        variant="date-compact"
        onPress={handlePressStartDate}
      />
      <TildeIcon />
      <DropdownField
        label={endDate ? endDate.replaceAll('-', '.') : '종료일'}
        accessibilityLabel="종료일 선택"
        variant="date-compact"
        onPress={handlePressEndDate}
      />
    </View>
  );
}
