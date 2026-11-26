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

import { getPopoverTop, type PopoverAnchor } from '@/shared/ui/popoverPosition';
import { COLORS } from '@/theme/theme.generated';

type DatePickerProps = {
  value: string;
  minimumDate?: string;
  anchor: PopoverAnchor;
  onSelect: (date: string) => void;
  onClose: () => void;
};

// Figma: Date and time - Pickers (3037:55473). 토큰에 없는 그림자라 시안 값을 그대로 쓴다.
export const DATE_PICKER_POPOVER_SHADOW =
  '0px 8.838px 26.514px 0px rgba(0, 0, 0, 0.1)';
export const DATE_PICKER_POPOVER_GAP = 6;

export function toLocalDate(value: string) {
  if (!value) return new Date();
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

export function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// OS 기본 달력. 값은 YYYY-MM-DD 문자열로 주고받는다.
// - iOS: 날짜 입력칸 아래 팝오버로 시스템 달력을 띄우고, 날짜를 누르면 바로 선택된다.
//   아래 공간이 모자라면(화면 아래쪽 입력칸) 입력칸 위로 띄운다.
// - Android: 시스템 달력 다이얼로그
export function DatePicker({
  value,
  minimumDate,
  anchor,
  onSelect,
  onClose,
}: DatePickerProps) {
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  // 달력 높이는 OS와 달의 주 수에 따라 달라서 그려 본 뒤에 잰다.
  const [popoverHeight, setPopoverHeight] = useState<number | null>(null);
  const popoverTop =
    popoverHeight === null
      ? anchor.bottom + DATE_PICKER_POPOVER_GAP
      : getPopoverTop(
          anchor,
          popoverHeight,
          { top: insets.top, bottom: windowHeight - insets.bottom },
          DATE_PICKER_POPOVER_GAP,
        );

  function handleNativeDateChange(_event: unknown, date: Date) {
    onSelect(toDateString(date));
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
        value={toLocalDate(value)}
        minimumDate={minimumDate ? toLocalDate(minimumDate) : undefined}
        mode="date"
        presentation="dialog"
        accentColor={COLORS['sky-60']}
        onValueChange={handleNativeDateChange}
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
          accessibilityLabel="날짜 선택 닫기"
          onPress={handleClose}
          className="absolute inset-0"
        />
        <View
          className="rounded-12 bg-surface-default absolute left-24 right-24 items-center pb-16"
          onLayout={handlePopoverLayout}
          style={{
            top: popoverTop,
            boxShadow: DATE_PICKER_POPOVER_SHADOW,
            // 높이를 재기 전에는 숨겨서 아래에 그렸다가 위로 옮겨지며 깜빡이지 않게 한다.
            opacity: popoverHeight === null ? 0 : 1,
          }}
        >
          <RNDateTimePicker
            value={toLocalDate(value)}
            minimumDate={minimumDate ? toLocalDate(minimumDate) : undefined}
            mode="date"
            display="inline"
            locale="ko_KR"
            onValueChange={handleNativeDateChange}
          />
        </View>
      </View>
    </Modal>
  );
}
