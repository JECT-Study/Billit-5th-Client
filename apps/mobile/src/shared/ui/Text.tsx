import { Text as RNText, type TextProps } from 'react-native';

type AppTextProps = TextProps & {
  className?: string;
};

const fontWeightClassPattern =
  /(?:^|\s)font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black)(?:\s|$)/;

export function Text({ className, ...props }: AppTextProps) {
  let resolvedClassName = 'font-normal';

  if (className && fontWeightClassPattern.test(className)) {
    resolvedClassName = className;
  } else if (className) {
    resolvedClassName = `font-normal ${className}`;
  }

  return <RNText className={resolvedClassName} {...props} />;
}
