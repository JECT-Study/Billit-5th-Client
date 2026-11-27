import { Pressable, View } from 'react-native';

import { Text } from '@/shared/ui/Text';
import { SHADOW } from '@/theme/theme.generated';

type TripAddExpenseMenuProps = {
  onPressManualExpense: () => void;
  onPressReceiptExpense: () => void;
};

export function TripAddExpenseMenu({
  onPressManualExpense,
  onPressReceiptExpense,
}: TripAddExpenseMenuProps) {
  function handlePressManualExpense() {
    onPressManualExpense();
  }

  function handlePressReceiptExpense() {
    onPressReceiptExpense();
  }

  return (
    <View
      accessibilityRole="menu"
      className="rounded-8 w-[148px] overflow-hidden bg-white py-[5px]"
      style={{ boxShadow: SHADOW.light }}
    >
      <Pressable
        accessibilityRole="menuitem"
        onPress={handlePressManualExpense}
        className="h-[40px] items-center justify-center px-10 py-6"
      >
        <Text className="text-label-1 text-strong font-medium">수기기록</Text>
      </Pressable>
      <Pressable
        accessibilityRole="menuitem"
        onPress={handlePressReceiptExpense}
        className="h-[40px] items-center justify-center px-10 py-6"
      >
        <Text className="text-label-1 text-strong font-medium">
          영수증 기록
        </Text>
      </Pressable>
    </View>
  );
}
