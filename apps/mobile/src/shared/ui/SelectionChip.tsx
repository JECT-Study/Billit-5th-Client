import { View } from 'react-native';

import { CheckIcon } from '@/shared/ui/icons';
import { Text } from '@/shared/ui/Text';
import { COLORS } from '@/theme/theme.generated';

// Figma: Selection / Chip (2260:16923)
// - dark: State=default (2260:16924)
// - disabled: State=disabled (2260:16926)
// - checked: State=checked (2260:16928). 오른쪽에 체크 아이콘
// - stroke: State=stroke (2260:16931)
// - white: State=status (3711:48879), 비로그인 참여자
// - solid: 진행중 (3227:83911)
// - light: 초대중 (3227:83922)
// - subtle: 예정 (3227:83857)
// - muted: 종료 (3227:83865)
export type SelectionChipTone =
  | 'dark'
  | 'disabled'
  | 'checked'
  | 'stroke'
  | 'white'
  | 'solid'
  | 'light'
  | 'subtle'
  | 'muted';

type SelectionChipProps = {
  label: string;
  tone: SelectionChipTone;
};

const TONE_STYLES: Record<
  SelectionChipTone,
  { containerClassName: string; labelClassName: string }
> = {
  dark: {
    containerClassName: 'h-28 px-10 bg-gray-8',
    labelClassName: 'text-gray-1',
  },
  disabled: {
    containerClassName: 'h-28 px-10 bg-gray-2',
    labelClassName: 'text-gray-5',
  },
  checked: {
    containerClassName: 'h-28 pl-10 pr-4 bg-sky-40',
    labelClassName: '-mr-2 text-black',
  },
  stroke: {
    containerClassName: 'h-28 px-10 border border-sky-60 bg-white',
    labelClassName: 'text-sky-60',
  },
  white: {
    containerClassName: 'h-26 px-10 bg-white',
    labelClassName: 'text-gray-6',
  },
  solid: {
    containerClassName: 'h-[22px] px-10 bg-sky-50',
    labelClassName: 'text-white',
  },
  light: {
    containerClassName: 'h-[22px] px-10 bg-sky-10',
    labelClassName: 'text-sky-50',
  },
  subtle: {
    containerClassName: 'h-[22px] px-10 bg-gray-1',
    labelClassName: 'text-gray-6',
  },
  muted: {
    containerClassName: 'h-[22px] px-10 bg-gray-3',
    labelClassName: 'text-gray-6',
  },
};

export function SelectionChip({ label, tone }: SelectionChipProps) {
  const toneStyle = TONE_STYLES[tone];

  return (
    <View
      className={`rounded-6 flex-row items-center justify-center ${toneStyle.containerClassName}`}
    >
      <Text
        className={`text-caption-2 font-semibold ${toneStyle.labelClassName}`}
      >
        {label}
      </Text>
      {tone === 'checked' ? (
        <CheckIcon size={24} color={COLORS['gray-8']} />
      ) : null}
    </View>
  );
}
