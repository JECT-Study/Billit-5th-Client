import { useMemo, useRef, useState } from 'react';
import { View } from 'react-native';

import {
  ALL_EXPENSE_DATE_VALUE,
  formatExpenseDateLabel,
  formatExpenseRangeLabel,
  getExpenseDateOptions,
  getSelectedExpenseDateValue,
  type TripExpenseFilter,
} from '@/features/trip/detail/tripExpenseFilter';
import { DateRangePicker } from '@/shared/ui/DateRangePicker';
import { DropdownField } from '@/shared/ui/DropdownField';
import { DropdownMenu } from '@/shared/ui/DropdownMenu';
import type { PopoverAnchor } from '@/shared/ui/popoverPosition';

const DATE_MENU_MAX_HEIGHT = 190;

type TripExpenseFilterBarProps = {
  filter: TripExpenseFilter;
  startDate: string;
  endDate: string;
  onSelectAll: () => void;
  onSelectDate: (date: string) => void;
  onSelectRange: (fromDate: string, toDate: string) => void;
  onClearRange: () => void;
};

// Figma: 지출 내역 필터 (3394:93802). 왼쪽은 날짜 하나, 오른쪽은 기간. 둘은 함께 쓰지 않는다.
export function TripExpenseFilterBar({
  filter,
  startDate,
  endDate,
  onSelectAll,
  onSelectDate,
  onSelectRange,
  onClearRange,
}: TripExpenseFilterBarProps) {
  const rowRef = useRef<View>(null);
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [rangeAnchor, setRangeAnchor] = useState<PopoverAnchor | null>(null);
  const dateOptions = useMemo(
    () => getExpenseDateOptions(startDate, endDate),
    [startDate, endDate],
  );
  const isRangeSelected = filter.type === 'RANGE';

  function handlePressDateField() {
    setIsDateMenuOpen((current) => !current);
  }

  function handleSelectDateOption(value: string) {
    setIsDateMenuOpen(false);
    if (value === ALL_EXPENSE_DATE_VALUE) onSelectAll();
    else onSelectDate(value);
  }

  function handlePressRangeField() {
    setIsDateMenuOpen(false);
    rowRef.current?.measureInWindow((_x, y, _width, height) => {
      setRangeAnchor({ top: y, bottom: y + height });
    });
  }

  function handleSelectRange(fromDate: string, toDate: string) {
    setRangeAnchor(null);
    onSelectRange(fromDate, toDate);
  }

  function handleCloseRangePicker() {
    setRangeAnchor(null);
  }

  function handlePressClearRange() {
    onClearRange();
  }

  // 기간을 골랐을 때만 ✕를 보여 준다.
  const handlePressClear = isRangeSelected ? handlePressClearRange : undefined;

  return (
    <View ref={rowRef} collapsable={false} className="z-10 flex-row gap-8">
      <View className="flex-1">
        <DropdownField
          label={formatExpenseDateLabel(filter)}
          accessibilityLabel="지출 날짜 선택"
          onPress={handlePressDateField}
          isFlexible={false}
        />
        {isDateMenuOpen ? (
          <View className="absolute inset-x-0 top-[52px]">
            <DropdownMenu
              options={dateOptions}
              selectedValue={getSelectedExpenseDateValue(filter)}
              onSelect={handleSelectDateOption}
              maxHeight={DATE_MENU_MAX_HEIGHT}
            />
          </View>
        ) : null}
      </View>
      <DropdownField
        label={formatExpenseRangeLabel(filter)}
        accessibilityLabel="지출 기간 선택"
        variant="date-compact"
        onPress={handlePressRangeField}
        isFlexible={false}
        onPressClear={handlePressClear}
        clearAccessibilityLabel="기간 선택 해제"
      />
      {rangeAnchor ? (
        <DateRangePicker
          initialDate={isRangeSelected ? filter.fromDate : startDate}
          anchor={rangeAnchor}
          onSelect={handleSelectRange}
          onClose={handleCloseRangePicker}
        />
      ) : null}
    </View>
  );
}
