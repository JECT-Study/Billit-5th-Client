import { View } from 'react-native';

import { Text } from '@/shared/ui/Text';

// Figma: Selection / Chip
// - solid: 진행중 (3227:83911)
// - light: 초대중 (3227:83922)
// - subtle: 예정 (3227:83857)
// - muted: 종료 (3227:83865)
export type SelectionChipTone =
  'solid' | 'light' | 'subtle' | 'muted' | 'stroke';

type SelectionChipProps = {
  label: string;
  tone: SelectionChipTone;
};

const TONE_STYLES: Record<
  SelectionChipTone,
  { containerClassName: string; labelClassName: string }
> = {
  solid: { containerClassName: 'bg-sky-50', labelClassName: 'text-white' },
  light: { containerClassName: 'bg-sky-10', labelClassName: 'text-sky-50' },
  subtle: { containerClassName: 'bg-gray-1', labelClassName: 'text-gray-6' },
  muted: { containerClassName: 'bg-gray-3', labelClassName: 'text-gray-6' },
  stroke: {
    containerClassName: 'border border-sky-60 bg-white',
    labelClassName: 'text-sky-60',
  },
};

export function SelectionChip({ label, tone }: SelectionChipProps) {
  const toneStyle = TONE_STYLES[tone];

  return (
    <View
      className={`rounded-6 items-center justify-center px-10 ${tone === 'stroke' ? 'h-28' : 'h-[22px]'} ${toneStyle.containerClassName}`}
    >
      <Text
        className={`text-caption-2 font-semibold ${toneStyle.labelClassName}`}
      >
        {label}
      </Text>
    </View>
  );
}
