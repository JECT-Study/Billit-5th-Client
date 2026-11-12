// react-native-svg-transformer: .svg 파일을 import하면 react-native-svg 컴포넌트가 됨
declare module '*.svg' {
  import type { FC } from 'react';
  import type { SvgProps } from 'react-native-svg';

  const content: FC<SvgProps>;
  export default content;
}
