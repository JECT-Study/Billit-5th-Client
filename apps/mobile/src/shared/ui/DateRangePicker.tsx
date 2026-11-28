import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/shared/ui/Button';
import {
  DATE_PICKER_POPOVER_GAP,
  DATE_PICKER_POPOVER_SHADOW,
  toDateString,
  toLocalDate,
} from '@/shared/ui/DatePicker';
import { getPopoverTop, type PopoverAnchor } from '@/shared/ui/popoverPosition';
import { Text } from '@/shared/ui/Text';
import { COLORS } from '@/theme/theme.generated';

type DateRangePickerProps = {
  initialDate: string;
  anchor: PopoverAnchor;
  onSelect: (fromDate: string, toDate: string) => void;
  onClose: () => void;
};

const TITLES = { from: '시작일 선택', to: '종료일 선택' } as const;
const CONFIRM_LABELS = { from: '다음', to: '완료' } as const;
const CANCEL_LABEL = '취소';

export function DateRangePicker({
  initialDate,
  anchor,
  onSelect,
  onClose,
}: DateRangePickerProps) {
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [draftDate, setDraftDate] = useState(initialDate);
  const [popoverHeight, setPopoverHeight] = useState<number | null>(null);
  const step = fromDate === null ? 'from' : 'to';
  const popoverTop =
    popoverHeight === null
      ? anchor.bottom + DATE_PICKER_POPOVER_GAP
      : getPopoverTop(
          anchor,
          popoverHeight,
          { top: insets.top, bottom: windowHeight - insets.bottom },
          DATE_PICKER_POPOVER_GAP,
        );

  function confirm(date: string) {
    if (fromDate === null) {
      setFromDate(date);
      setDraftDate(date);
      return;
    }
    onSelect(fromDate, date);
  }

  function handleAndroidDateConfirm(_event: unknown, date: Date) {
    confirm(toDateString(date));
  }

  function handleIosDateChange(_event: unknown, date: Date) {
    setDraftDate(toDateString(date));
  }

  function handlePressConfirm() {
    confirm(draftDate);
  }

  function handleClose() {
    onClose();
  }

  function handlePopoverLayout(event: LayoutChangeEvent) {
    setPopoverHeight(event.nativeEvent.layout.height);
  }

  if (Platform.OS === 'android') {
    return (
      <DateTimePicker
        key={step}
        value={toLocalDate(fromDate ?? initialDate)}
        minimumDate={fromDate ? toLocalDate(fromDate) : undefined}
        mode="date"
        presentation="dialog"
        accentColor={COLORS['sky-60']}
        positiveButton={{ label: CONFIRM_LABELS[step] }}
        negativeButton={{ label: CANCEL_LABEL }}
        onValueChange={handleAndroidDateConfirm}
        onDismiss={handleClose}
      />
    );
  }

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View className="flex-1">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="기간 선택 닫기"
          onPress={handleClose}
          className="absolute inset-0"
        />
        <View
          className="rounded-12 bg-surface-default absolute left-24 right-24 items-center px-16 pb-16 pt-16"
          onLayout={handlePopoverLayout}
          style={{
            top: popoverTop,
            boxShadow: DATE_PICKER_POPOVER_SHADOW,
            opacity: popoverHeight === null ? 0 : 1,
          }}
        >
          <Text
            accessibilityRole="header"
            className="text-label-1 text-primary font-semibold"
          >
            {TITLES[step]}
          </Text>
          <RNDateTimePicker
            value={toLocalDate(draftDate)}
            minimumDate={fromDate ? toLocalDate(fromDate) : undefined}
            mode="date"
            display="inline"
            locale="ko_KR"
            themeVariant="light"
            onValueChange={handleIosDateChange}
          />
          <View className="w-full flex-row gap-8">
            <Button
              label={CANCEL_LABEL}
              variant="light"
              size="compact"
              onPress={handleClose}
              className="flex-1"
            />
            <Button
              label={CONFIRM_LABELS[step]}
              size="compact"
              onPress={handlePressConfirm}
              className="flex-1"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
