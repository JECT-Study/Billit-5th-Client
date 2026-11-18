import { View } from 'react-native';

import { CheckIcon } from '@/shared/ui/icons';
import { COLORS } from '@/theme/theme.generated';

type CheckboxProps = {
  isChecked: boolean;
};

// 표시만 담당한다. 누르기와 접근성 상태는 감싸는 행(Pressable)에서 다룬다.
// TODO(디자인 확인): Figma "Selection / Check"에는 미선택 상태만 있어 선택 상태 색은 임시값이다.
export function Checkbox({ isChecked }: CheckboxProps) {
  return (
    <View
      className={`h-24 w-24 items-center justify-center rounded ${
        isChecked ? 'bg-action-primary-background' : 'bg-gray-2'
      }`}
    >
      {isChecked && (
        <CheckIcon size={24} color={COLORS['action-primary-foreground']} />
      )}
    </View>
  );
}
