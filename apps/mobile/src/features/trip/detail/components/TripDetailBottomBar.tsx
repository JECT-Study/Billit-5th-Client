import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TripAddExpenseMenu } from '@/features/trip/detail/components/TripAddExpenseMenu';
import { Button } from '@/shared/ui/Button';
import { GradientBackground } from '@/shared/ui/GradientBackground';
import { COLORS } from '@/theme/theme.generated';

const FADE_HEIGHT = 40;
const BUTTON_HEIGHT = 56;
const BOTTOM_GAP = 8;

export const TRIP_DETAIL_BOTTOM_BAR_HEIGHT =
  FADE_HEIGHT + BUTTON_HEIGHT + BOTTOM_GAP;

type TripDetailBottomBarProps = {
  isSettlementVisible: boolean;
  isAddExpenseMenuOpen: boolean;
  onPressSettlement: () => void;
  onPressAddExpense: () => void;
  onPressManualExpense: () => void;
  onPressReceiptExpense: () => void;
};

export function TripDetailBottomBar({
  isSettlementVisible,
  isAddExpenseMenuOpen,
  onPressSettlement,
  onPressAddExpense,
  onPressManualExpense,
  onPressReceiptExpense,
}: TripDetailBottomBarProps) {
  const insets = useSafeAreaInsets();

  function handlePressSettlement() {
    onPressSettlement();
  }

  function handlePressAddExpense() {
    onPressAddExpense();
  }

  function handlePressManualExpense() {
    onPressManualExpense();
  }

  function handlePressReceiptExpense() {
    onPressReceiptExpense();
  }

  return (
    <View pointerEvents="box-none" className="absolute inset-x-0 bottom-0">
      <View pointerEvents="none" style={{ height: FADE_HEIGHT }}>
        <GradientBackground
          startColor={COLORS.white}
          startOpacity={0}
          endColor={COLORS.white}
        />
      </View>
      <View
        className="flex-row gap-12 bg-white px-24"
        style={{ paddingBottom: insets.bottom + BOTTOM_GAP }}
      >
        {isSettlementVisible ? (
          <Button
            label="정산하기"
            variant="tinted"
            onPress={handlePressSettlement}
            className="flex-1"
          />
        ) : null}
        <View className="flex-1">
          {isAddExpenseMenuOpen ? (
            <View
              className={`absolute bottom-full mb-[7px] ${isSettlementVisible ? 'right-0' : 'inset-x-0 items-center'}`}
            >
              <TripAddExpenseMenu
                onPressManualExpense={handlePressManualExpense}
                onPressReceiptExpense={handlePressReceiptExpense}
              />
            </View>
          ) : null}
          <Button label="지출 추가하기" onPress={handlePressAddExpense} />
        </View>
      </View>
    </View>
  );
}
