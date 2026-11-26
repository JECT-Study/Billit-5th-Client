import type { ComponentType } from 'react';
import { Pressable } from 'react-native';

import type { IconProps } from '@/shared/ui/icons';
import { Text } from '@/shared/ui/Text';
import { COLORS, SHADOW, TEXT_COLORS } from '@/theme/theme.generated';

// Figma: Button / CTA (2260:17365)
// - primary: default, compact-primary
// - secondary: secondary, compact-secondary
// - black, error, light: 같은 이름의 variant
// - tinted: 옅은 하늘색 배경의 보조 CTA (여행방 「정산하기」, 3394:93834)
// - outline: icon (테두리 버튼)
// - inline: inline, inline-icon (크기가 따로 정해져 있어 size를 쓰지 않음)
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'black'
  | 'error'
  | 'light'
  | 'tinted'
  | 'outline'
  | 'inline';

export type ButtonSize = 'large' | 'compact';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isDisabled?: boolean;
  // 글자 오른쪽에 붙는 아이콘. 색은 variant에 맞춰 넣어 준다.
  icon?: ComponentType<IconProps>;
  className?: string;
};

type VariantStyle = {
  containerClassName: string;
  labelClassName: string;
  iconColor: string;
  hasInnerGlow: boolean;
};

const VARIANT_STYLES: Record<ButtonVariant, VariantStyle> = {
  primary: {
    containerClassName: 'bg-action-primary-background',
    labelClassName: 'text-action-primary-foreground',
    iconColor: COLORS['action-primary-foreground'],
    hasInnerGlow: true,
  },
  secondary: {
    containerClassName: 'bg-gray-3',
    labelClassName: 'text-primary',
    iconColor: TEXT_COLORS.primary,
    hasInnerGlow: true,
  },
  black: {
    containerClassName: 'bg-black',
    labelClassName: 'text-white',
    iconColor: COLORS.white,
    hasInnerGlow: false,
  },
  error: {
    containerClassName: 'bg-red-alert-dark',
    labelClassName: 'text-white',
    iconColor: COLORS.white,
    hasInnerGlow: true,
  },
  light: {
    containerClassName: '',
    labelClassName: 'text-secondary',
    iconColor: TEXT_COLORS.secondary,
    hasInnerGlow: false,
  },
  tinted: {
    containerClassName: 'bg-sky-10',
    labelClassName: 'text-action-primary-background',
    iconColor: COLORS['action-primary-background'],
    hasInnerGlow: true,
  },
  outline: {
    containerClassName: 'border border-gray-6',
    labelClassName: 'text-primary',
    iconColor: TEXT_COLORS.primary,
    hasInnerGlow: true,
  },
  inline: {
    containerClassName: 'bg-sky-20',
    labelClassName: 'text-brand',
    iconColor: TEXT_COLORS.brand,
    hasInnerGlow: false,
  },
};

// Figma의 disabled variant는 secondary와 같은 모습
const DISABLED_STYLE = VARIANT_STYLES.secondary;

const SIZE_CLASS_NAMES: Record<
  ButtonSize,
  { container: string; label: string }
> = {
  large: {
    container: 'h-58 rounded-14 gap-10 px-10',
    label: 'text-headline-1',
  },
  compact: {
    container: 'h-[52px] rounded-14 gap-10 px-10',
    label: 'text-label-1',
  },
};

function getSizeClassNames(
  variant: ButtonVariant,
  size: ButtonSize,
  hasIcon: boolean,
) {
  if (variant === 'inline') {
    return {
      container: `rounded-6 self-start py-6 pl-16 ${hasIcon ? 'pr-8' : 'pr-16'}`,
      label: 'text-label-1',
    };
  }
  return SIZE_CLASS_NAMES[size];
}

function getLabelClassName(variant: ButtonVariant, size: ButtonSize) {
  // Figma compact-secondary만 글자색이 한 단계 옅음
  if (variant === 'secondary' && size === 'compact') {
    return 'text-secondary';
  }
  return VARIANT_STYLES[variant].labelClassName;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'large',
  isDisabled = false,
  icon: Icon,
  className,
}: ButtonProps) {
  const variantStyle = isDisabled ? DISABLED_STYLE : VARIANT_STYLES[variant];
  const sizeClassNames = getSizeClassNames(variant, size, Icon !== undefined);
  const labelColorClassName = isDisabled
    ? DISABLED_STYLE.labelClassName
    : getLabelClassName(variant, size);

  function handlePress() {
    onPress();
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={handlePress}
      className={`flex-row items-center justify-center ${sizeClassNames.container} ${variantStyle.containerClassName} ${className ?? ''}`}
      style={
        variantStyle.hasInnerGlow
          ? { boxShadow: SHADOW['inner-glow'] }
          : undefined
      }
    >
      <Text
        className={`${sizeClassNames.label} ${labelColorClassName} font-semibold`}
      >
        {label}
      </Text>
      {Icon ? <Icon size={24} color={variantStyle.iconColor} /> : null}
    </Pressable>
  );
}
