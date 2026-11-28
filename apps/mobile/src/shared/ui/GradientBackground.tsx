import { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { COLORS } from '@/theme/theme.generated';

// 디자인 토큰에 없는 그라데이션 끝 색상 (Figma: 여행방 화면 배경)
const GRADIENT_END_COLOR = '#EDF8FF';

type GradientBackgroundProps = {
  startColor?: string;
  startOpacity?: number;
  endColor?: string;
  endOpacity?: number;
};

/** 부모를 가득 채우는 세로(위→아래) 그라데이션. 부모의 첫 번째 자식으로 둔다. */
export function GradientBackground({
  startColor = COLORS.white,
  startOpacity = 1,
  endColor = GRADIENT_END_COLOR,
  endOpacity = 1,
}: GradientBackgroundProps) {
  const gradientId = `gradient-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop
              offset="0"
              stopColor={startColor}
              stopOpacity={startOpacity}
            />
            <Stop offset="1" stopColor={endColor} stopOpacity={endOpacity} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>
    </View>
  );
}
