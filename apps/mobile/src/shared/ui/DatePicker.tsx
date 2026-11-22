import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { Modal, Platform, Pressable, View } from 'react-native';

import { COLORS } from '@/theme/theme.generated';

type DatePickerProps = {
  value: string;
  minimumDate?: string;
  // iOS 팝오버가 시작할 화면 위쪽 좌표(날짜 입력칸 바로 아래). Android 다이얼로그에서는 쓰지 않는다.
  anchorTop: number;
  onSelect: (date: string) => void;
  onClose: () => void;
};

// Figma: Date and time - Pickers (3037:55473). 토큰에 없는 그림자라 시안 값을 그대로 쓴다.
const POPOVER_SHADOW = '0px 8.838px 26.514px 0px rgba(0, 0, 0, 0.1)';

function toLocalDate(value: string) {
  if (!value) return new Date();
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// OS 기본 달력. 값은 YYYY-MM-DD 문자열로 주고받는다.
// - iOS: 날짜 입력칸 아래 팝오버로 시스템 달력을 띄우고, 날짜를 누르면 바로 선택된다.
// - Android: 시스템 달력 다이얼로그
export function DatePicker({
  value,
  minimumDate,
  anchorTop,
  onSelect,
  onClose,
}: DatePickerProps) {
  function handleNativeDateChange(_event: unknown, date: Date) {
    onSelect(toDateString(date));
  }

  function handleClose() {
    onClose();
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
          style={{ top: anchorTop, boxShadow: POPOVER_SHADOW }}
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
