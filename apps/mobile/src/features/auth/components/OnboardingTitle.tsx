import { GradientText } from '@/shared/ui/GradientText';
import { COLORS, TEXT_COLORS } from '@/theme/theme.generated';

// Figma 제목: SUIT Bold 24/32(title-3), 왼쪽(#292C2D) → 오른쪽(#43A0BF) 그라데이션 글자
type OnboardingTitleProps = {
  title: string;
};

export function OnboardingTitle({ title }: OnboardingTitleProps) {
  return (
    <GradientText
      text={title}
      size="title-3"
      family="suit-bold"
      className="text-title-3 font-bold"
      startColor={TEXT_COLORS.primary}
      endColor={COLORS['teal-gradient-end']}
      accessibilityRole="header"
    />
  );
}
