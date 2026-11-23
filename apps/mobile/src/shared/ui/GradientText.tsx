import { useId, useState } from 'react';
import {
  StyleSheet,
  View,
  type AccessibilityRole,
  type NativeSyntheticEvent,
  type TextLayoutEventData,
  type TextLayoutLine,
} from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Text as SvgText,
  TSpan,
} from 'react-native-svg';

import { Text } from '@/shared/ui/Text';
import { FONT_FAMILY, FONT_SIZE } from '@/theme/theme.generated';

type FontSizeToken = keyof typeof FONT_SIZE;
type FontFamilyToken = keyof typeof FONT_FAMILY;

type GradientTextProps = {
  text: string;
  size: FontSizeToken;
  family: FontFamilyToken;
  className: string;
  startColor: string;
  endColor: string;
  // 스크린리더는 숨긴 RN Text를 읽으므로 제목이면 'header'를 넘긴다.
  accessibilityRole?: AccessibilityRole;
};

export function GradientText({
  text,
  size,
  family,
  className,
  startColor,
  endColor,
  accessibilityRole,
}: GradientTextProps) {
  const [lines, setLines] = useState<TextLayoutLine[]>([]);
  const gradientId = `gradient-text-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const [fontSize, { letterSpacing }] = FONT_SIZE[size];

  function handleTextLayout(event: NativeSyntheticEvent<TextLayoutEventData>) {
    setLines(event.nativeEvent.lines);
  }

  const width = Math.max(0, ...lines.map((line) => line.x + line.width));
  const height = Math.max(0, ...lines.map((line) => line.y + line.height));

  return (
    <View>
      <Text
        className={className}
        style={styles.hidden}
        accessibilityRole={accessibilityRole}
        onTextLayout={handleTextLayout}
      >
        {text}
      </Text>
      {lines.length > 0 ? (
        <Svg
          width={width}
          height={height}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Defs>
            <LinearGradient
              id={gradientId}
              x1="0"
              y1="0"
              x2={width}
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0" stopColor={startColor} />
              <Stop offset="1" stopColor={endColor} />
            </LinearGradient>
          </Defs>
          <SvgText
            fontFamily={FONT_FAMILY[family]}
            fontSize={fontSize}
            letterSpacing={letterSpacing}
            fill={`url(#${gradientId})`}
          >
            {lines.map((line, index) => (
              <TSpan key={index} x={line.x} y={line.y + line.ascender}>
                {line.text.replace(/\n$/, '')}
              </TSpan>
            ))}
          </SvgText>
        </Svg>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hidden: { opacity: 0 },
});
