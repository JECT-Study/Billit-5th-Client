import type { FC } from 'react';
import type { SvgProps } from 'react-native-svg';

import { DEFAULT_ICON_COLOR, type IconProps } from './types';

/**
 * SVG 파일(react-native-svg-transformer가 만든 컴포넌트)에 아이콘 공통 props를 붙인다.
 * - size: 가로·세로 크기 (기본값은 Figma 아이콘 크기)
 * - color: SVG 안의 currentColor 색 (기본값은 icon-default)
 */
export function createIcon(
  Svg: FC<SvgProps>,
  defaultSize: number,
  displayName: string,
) {
  function Icon({
    size = defaultSize,
    color = DEFAULT_ICON_COLOR,
    ...props
  }: IconProps) {
    return <Svg width={size} height={size} color={color} {...props} />;
  }
  Icon.displayName = displayName;
  return Icon;
}
