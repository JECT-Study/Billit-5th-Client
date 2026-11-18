import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { COLORS } from '@/theme/theme.generated';

// 디자인 토큰에 없는 그라데이션 끝 색상 (Figma: 여행방 화면 배경)
const GRADIENT_END_COLOR = '#EDF8FF';
const GRADIENT_ID = 'gradient-background';

type GradientBackgroundProps = {
  startColor?: string;
  endColor?: string;
};

/** 부모를 가득 채우는 세로(위→아래) 그라데이션. 부모의 첫 번째 자식으로 둔다. */
export function GradientBackground({
  startColor = COLORS.white,
  endColor = GRADIENT_END_COLOR,
}: GradientBackgroundProps) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={startColor} />
            <Stop offset="1" stopColor={endColor} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${GRADIENT_ID})`} />
      </Svg>
    </View>
  );
}
