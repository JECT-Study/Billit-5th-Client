import { Pressable, View } from 'react-native';

import { Text } from '@/shared/ui/Text';
import { SHADOW } from '@/theme/theme.generated';

type TripAddExpenseMenuProps = {
  // 일반 참여자(지출 추가하기 버튼만 전체 너비)일 때 버튼과 같은 너비로 펼친다
  isFullWidth?: boolean;
  onPressManualExpense: () => void;
  onPressReceiptExpense: () => void;
};

// Figma: Dropdown / Menu (2260:17020), 일반 참여자 화면 3830:53104
export function TripAddExpenseMenu({
  isFullWidth = false,
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
      className={`rounded-8 gap-8 overflow-hidden bg-white py-6 ${isFullWidth ? 'w-full' : 'w-[148px]'}`}
      style={{ boxShadow: SHADOW.light }}
    >
      <Pressable
        accessibilityRole="menuitem"
        onPress={handlePressManualExpense}
        className="h-[40px] items-center justify-center px-10 py-6"
      >
        <Text className="text-label-1 text-strong font-medium">수기 기록</Text>
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
