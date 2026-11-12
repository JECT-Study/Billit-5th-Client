import type { SvgProps } from 'react-native-svg';

import { COLORS } from '@/theme/theme.generated';

// 색을 지정하지 않으면 Figma 기본 아이콘 색(icon/default)을 사용
export const DEFAULT_ICON_COLOR = COLORS['icon-default'];

export type IconProps = Omit<SvgProps, 'width' | 'height' | 'color'> & {
  size?: number;
  color?: string;
};
