import { useRef, useState } from 'react';
import { View } from 'react-native';

import { DatePicker } from '@/shared/ui/DatePicker';
import { DropdownDateRange } from '@/shared/ui/DropdownDateRange';
import { Text } from '@/shared/ui/Text';

type DateTarget = 'startDate' | 'endDate';

type TripDateRangeFieldProps = {
  startDate: string;
  endDate: string;
  onSelectDate: (target: DateTarget, date: string) => void;
};

const DATE_PICKER_GAP = 6;

export function TripDateRangeField({
  startDate,
  endDate,
  onSelectDate,
}: TripDateRangeFieldProps) {
  const dateRangeRef = useRef<View>(null);
  const [pickerTarget, setPickerTarget] = useState<DateTarget | null>(null);
  const [anchorTop, setAnchorTop] = useState(0);

  function openDatePicker(target: DateTarget) {
    dateRangeRef.current?.measureInWindow((_x, y, _width, height) => {
      setAnchorTop(y + height + DATE_PICKER_GAP);
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
      {pickerTarget ? (
        <DatePicker
          value={pickerTarget === 'startDate' ? startDate : endDate}
          anchorTop={anchorTop}
          onSelect={handleSelectDate}
          onClose={handleClose}
        />
      ) : null}
    </View>
  );
}
