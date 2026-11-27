import { useRef, useState } from 'react';
import { Platform, View } from 'react-native';

import { getTripDateRangeError } from '@/features/trip/shared/tripCreationSchema';
import { DatePicker } from '@/shared/ui/DatePicker';
import { DropdownDateRange } from '@/shared/ui/DropdownDateRange';
import type { PopoverAnchor } from '@/shared/ui/popoverPosition';
import { Text } from '@/shared/ui/Text';
import { COLORS } from '@/theme/theme.generated';

type DateTarget = 'startDate' | 'endDate';

type TripDateRangeFieldProps = {
  startDate: string;
  endDate: string;
  onSelectDate: (target: DateTarget, date: string) => void;
};

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function TripDateRangeField({
  startDate,
  endDate,
  onSelectDate,
}: TripDateRangeFieldProps) {
  const dateRangeRef = useRef<View>(null);
  const [pickerTarget, setPickerTarget] = useState<DateTarget | null>(null);
  const [anchor, setAnchor] = useState<PopoverAnchor>({ top: 0, bottom: 0 });
  const errorMessage = getTripDateRangeError(startDate, endDate);

  function openDatePicker(target: DateTarget) {
    const currentDate = target === 'startDate' ? startDate : endDate;
    if (Platform.OS === 'ios' && !currentDate) {
      const today = getTodayDateString();
      const initialDate =
        target === 'endDate' && startDate > today ? startDate : today;
      onSelectDate(target, initialDate);
    }

    dateRangeRef.current?.measureInWindow((_x, y, _width, height) => {
      setAnchor({ top: y, bottom: y + height });
      setPickerTarget(target);
    });
  }

  function handlePressStartDate() {
    openDatePicker('startDate');
  }

  function handlePressEndDate() {
    openDatePicker('endDate');
  }

  function handleSelectDate(date: string) {
    if (pickerTarget) onSelectDate(pickerTarget, date);
    setPickerTarget(null);
  }

  function handleClose() {
    setPickerTarget(null);
  }

  return (
    <View className="gap-10">
      <Text className="text-secondary text-label-1 font-medium">여행 기간</Text>
      <View ref={dateRangeRef} collapsable={false}>
        <DropdownDateRange
          startDate={startDate}
          endDate={endDate}
          onPressStartDate={handlePressStartDate}
          onPressEndDate={handlePressEndDate}
        />
      </View>
      {errorMessage ? (
        <Text
          className="text-caption-2 font-semibold"
          style={{ color: COLORS['red-alert-dark'] }}
        >
          {errorMessage}
        </Text>
      ) : null}
      {pickerTarget ? (
        <DatePicker
          value={pickerTarget === 'startDate' ? startDate : endDate}
          minimumDate={pickerTarget === 'endDate' ? startDate : undefined}
          anchor={anchor}
          onSelect={handleSelectDate}
          onClose={handleClose}
        />
      ) : null}
    </View>
  );
}
