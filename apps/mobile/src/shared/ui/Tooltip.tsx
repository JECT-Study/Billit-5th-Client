import { View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

import { Text } from '@/shared/ui/Text';
import { COLORS } from '@/theme/theme.generated';

// Figma comp > Feedback / Tooltip (node 2260:16948). 꼬리는 가운데 아래를 향한다
type TooltipProps = {
  label: string;
};

// Figma 꼬리: 10x10 박스 안에서 좌우 6.7% 안쪽, 위 0 / 아래 25% 안쪽의 삼각형을 180° 회전한 모양
const TAIL_BOX = 10;
const TAIL_POINTS = '0.67,2.5 9.33,2.5 5,10';

export function Tooltip({ label }: TooltipProps) {
  return (
    <View className="items-center" pointerEvents="none">
      {/* Figma는 높이 23 고정 + 패딩 10이라 글자가 가운데 정렬됨. 가장 가까운 spacing 토큰 py-4 사용 (24px) */}
      <View className="rounded-8 bg-sky-90 px-10 py-4">
        <Text className="text-caption-1 font-semibold text-white">{label}</Text>
      </View>
      {/* 꼬리는 본문과 6px 겹친다 (Figma itemSpacing -6) */}
      <View className="-mt-6">
        <Svg width={TAIL_BOX} height={TAIL_BOX}>
          <Polygon points={TAIL_POINTS} fill={COLORS['sky-90']} />
        </Svg>
      </View>
    </View>
  );
}
