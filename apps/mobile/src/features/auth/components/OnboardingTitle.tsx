import { View } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Text as SvgText,
  TSpan,
} from 'react-native-svg';

import { COLORS, FONT_FAMILY, TEXT_COLORS } from '@/theme/theme.generated';

// Figma 제목: SUIT Bold 24/32, 왼쪽(#292C2D) → 오른쪽(#43A0BF) 그라데이션 글자
// RN Text는 글자에 그라데이션을 칠할 수 없어서 SVG 텍스트로 그린다.
const TITLE_FONT_SIZE = 24;
const TITLE_LINE_HEIGHT = 32;
const TITLE_LETTER_SPACING = -0.55;
const TITLE_GRADIENT_ID = 'onboardingTitleGradient';

type OnboardingTitleProps = {
  title: string;
};

export function OnboardingTitle({ title }: OnboardingTitleProps) {
  const lines = title.split('\n');

  return (
    <View
      accessible
      accessibilityRole="header"
      accessibilityLabel={lines.join(' ')}
    >
      <Svg width="100%" height={lines.length * TITLE_LINE_HEIGHT}>
        <Defs>
          <LinearGradient id={TITLE_GRADIENT_ID} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={TEXT_COLORS.primary} />
            <Stop offset="1" stopColor={COLORS['teal-gradient-end']} />
          </LinearGradient>
        </Defs>
        <SvgText
          fill={`url(#${TITLE_GRADIENT_ID})`}
          fontFamily={FONT_FAMILY['suit-bold']}
          fontSize={TITLE_FONT_SIZE}
          letterSpacing={TITLE_LETTER_SPACING}
          alignmentBaseline="central"
        >
          {lines.map((line, lineIndex) => (
            <TSpan
              key={line}
              x={0}
              y={lineIndex * TITLE_LINE_HEIGHT + TITLE_LINE_HEIGHT / 2}
            >
              {line}
            </TSpan>
          ))}
        </SvgText>
      </Svg>
    </View>
  );
}
