import { Pressable, View } from 'react-native';

import { Checkbox } from '@/shared/ui/Checkbox';
import { CaretRightMdIcon } from '@/shared/ui/icons';
import { Text } from '@/shared/ui/Text';
import { COLORS } from '@/theme/theme.generated';

type SignupAgreementRowProps = {
  label: string;
  isRequired: boolean;
  isChecked: boolean;
  onToggle: () => void;
  // 없으면 오른쪽 화살표를 그리지 않고 자리만 비워 둔다.
  onPressDetail?: () => void;
};

export function SignupAgreementRow({
  label,
  isRequired,
  isChecked,
  onToggle,
  onPressDetail,
}: SignupAgreementRowProps) {
  function handlePressToggle() {
    onToggle();
  }

  function handlePressDetail() {
    onPressDetail?.();
  }

  return (
    <View className="h-24 flex-row items-center justify-between">
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={`${label}, ${isRequired ? '필수' : '선택'}`}
        accessibilityState={{ checked: isChecked }}
        hitSlop={{ top: 9, bottom: 9 }}
        onPress={handlePressToggle}
        className="flex-1 flex-row items-center gap-10"
      >
        <Checkbox isChecked={isChecked} />
        {/* Figma 기준 라벨과 별표 사이 1px. 1px 간격 토큰이 없어 style로 둔다 */}
        <View className="shrink flex-row items-start" style={{ gap: 1 }}>
          <Text
            numberOfLines={1}
            className="text-body-1 text-gray-7 shrink font-semibold"
          >
            {isRequired ? label : `${label} (선택)`}
          </Text>
          {isRequired && <RequiredMark />}
        </View>
      </Pressable>
      {onPressDetail ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label} 내용 보기`}
          hitSlop={{ top: 9, bottom: 9, left: 9, right: 9 }}
          onPress={handlePressDetail}
          className="ml-10"
        >
          <CaretRightMdIcon color={COLORS['icon-inactive']} />
        </Pressable>
      ) : (
        <View className="ml-10 h-24 w-24" />
      )}
    </View>
  );
}

// TODO(에셋): Figma의 mdi:asterisk(9×9, 노드 2580:68848) SVG를 assets/icons에 받아 아이콘으로 바꾼다.
function RequiredMark() {
  return (
    <Text
      accessible={false}
      className="text-status-required text-caption-1 font-semibold"
    >
      *
    </Text>
  );
}
